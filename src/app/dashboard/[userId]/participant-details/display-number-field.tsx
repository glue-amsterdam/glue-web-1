"use client";

import { useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2 } from "lucide-react";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";

interface DisplayNumberFieldProps {
  isMod: boolean;
  targetUserId?: string;
}

export function DisplayNumberField({
  isMod,
  targetUserId,
}: DisplayNumberFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ParticipantDetails>();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkedValue, setCheckedValue] = useState("");
  const latestValueRef = useRef("");
  const requestIdRef = useRef(0);

  const checkAvailability = useDebouncedCallback(async (value: string) => {
    if (!value || !isMod) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsChecking(true);

    try {
      const response = await fetch("/api/check-display-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayNumber: value,
          entityType: "participant",
          entityId: targetUserId,
        }),
      });

      if (
        requestId !== requestIdRef.current ||
        value !== latestValueRef.current
      ) {
        return;
      }

      if (response.ok) {
        const { isAvailable: available } = await response.json();
        setIsAvailable(available);
        setCheckedValue(value);
      } else {
        setIsAvailable(null);
      }
    } catch (error) {
      if (
        requestId === requestIdRef.current &&
        value === latestValueRef.current
      ) {
        console.error("Error checking display number:", error);
        setIsAvailable(null);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsChecking(false);
      }
    }
  }, 600);

  const handleDisplayNumberChange = (value: string) => {
    latestValueRef.current = value;

    if (!value) {
      checkAvailability.cancel();
      requestIdRef.current += 1;
      setIsChecking(false);
      setIsAvailable(null);
      setCheckedValue("");
      return;
    }

    setIsAvailable(null);
    setCheckedValue("");
    checkAvailability(value);
  };

  if (!isMod) {
    return null;
  }

  return (
    <div className="space-y-2 max-w-[300px]">
      <Label htmlFor="display_number">Display Number</Label>
      <div className="relative">
        <input
          id="display_number"
          placeholder="eg. 1, 1A"
          maxLength={10}
          {...register("display_number", {
            onChange: (e) => handleDisplayNumberChange(e.target.value),
          })}
          className={`w-[100px] ${isAvailable === false
            ? "border-red-500"
            : isAvailable === true
              ? "border-green-500"
              : ""
            }`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isChecking && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {!isChecking && isAvailable === true && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          {!isChecking && isAvailable === false && (
            <X className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
      {isChecking && (
        <p className="text-sm text-gray-500">Checking availability...</p>
      )}
      {!isChecking && isAvailable === false && (
        <p className="text-sm text-red-500" role="alert">
          The display number &quot;{checkedValue}&quot; is already in use.
        </p>
      )}
      {errors.display_number && (
        <p className="text-sm text-red-500">{errors.display_number.message}</p>
      )}
      <p className="text-xs text-gray-500">
        Optional. Used to display a number-letter identifier on the map (e.g.,
        1A, 2B, 3). Must be unique across all participants and hubs.
      </p>
    </div>
  );
}
