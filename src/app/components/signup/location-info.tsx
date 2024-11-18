"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
interface LocationInfoProps {
  attemptedNextStep: boolean;
}

export default function LocationInfo({ attemptedNextStep }: LocationInfoProps) {
  const {
    register,
    watch,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useFormContext();

  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const noAddress = watch("noAddress");
  const addressValue = watch("address");

  useEffect(() => {
    if (noAddress) {
      clearErrors("address");
      setValue("address", "");
      setLocalError(undefined);
    } else if (!addressValue) {
      const errorMessage =
        "Address is required when 'I don't have a physical address' is not checked";
      setError("address", { type: "manual", message: errorMessage });
      setLocalError(errorMessage);
    } else {
      clearErrors("address");
      setLocalError(undefined);
    }
  }, [noAddress, addressValue, clearErrors, setValue, setError]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("address", value);
    if (!noAddress && !value) {
      const errorMessage =
        "Address is required when 'I don't have a physical address' is not checked";
      setError("address", { type: "manual", message: errorMessage });
      setLocalError(errorMessage);
    } else {
      clearErrors("address");
      setLocalError(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Location Information</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="noAddress"
            checked={noAddress}
            onCheckedChange={(checked) => {
              setValue("noAddress", checked);
              if (checked) {
                clearErrors("address");
                setValue("address", "");
                setLocalError(undefined);
              } else if (!addressValue) {
                const errorMessage =
                  "Address is required when 'I don't have a physical address' is not checked";
                setError("address", { type: "manual", message: errorMessage });
                setLocalError(errorMessage);
              }
            }}
          />
          <Label htmlFor="noAddress" className="text-white">
            {`I don't have a physical address`}
          </Label>
        </div>
        <div>
          <Label htmlFor="address" className="text-white">
            Address
          </Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Address 123 Main St, New York, NY 10001"
            className="dashboard-input placeholder:text-sm"
            disabled={noAddress}
            onChange={handleAddressChange}
          />
          {attemptedNextStep && (localError || errors.address) && (
            <p className="text-red-500 mt-1 text-sm" role="alert">
              {localError || (errors.address?.message as string)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
