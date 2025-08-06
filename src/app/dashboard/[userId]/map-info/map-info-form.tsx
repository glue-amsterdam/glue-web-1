"use client";

import { useState, useEffect } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mapboxSdk from "@mapbox/mapbox-sdk/services/geocoding";
import { MapInfo, mapInfoSchema } from "@/schemas/mapInfoSchemas";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { config } from "@/env";
import { strToNumber } from "@/constants";

const mapboxClient = mapboxSdk({
  accessToken: config.mapboxAccesToken,
});

interface MapInfoFormProps {
  initialData: MapInfo | { error: string } | undefined;
  targetUserId: string;
}

function FormFields() {
  const { control, watch, setValue } = useFormContext<MapInfo>();
  const [suggestions, setSuggestions] = useState<
    Array<{ place_name: string; center: [number, number] }>
  >([]);

  const westLimit = strToNumber(config.cityBoundWest);
  const southLimit = strToNumber(config.cityBoundSouth);
  const eastLimit = strToNumber(config.cityBoundEast);
  const northLimit = strToNumber(config.cityBoundNorth);

  const centerLng = strToNumber(config.cityCenterLng);
  const centerLat = strToNumber(config.cityCenterLat);

  const noAddress = watch("no_address");

  const handleAddressChange = async (input: string) => {
    if (input.length > 2) {
      const response = await mapboxClient
        .forwardGeocode({
          query: input,
          limit: 5,
          countries: [config.countryPreFix],
          types: ["address"],
          bbox: [westLimit, southLimit, eastLimit, northLimit], // Bounding box
          proximity: [centerLng, centerLat], // Center
        })
        .send();

      setSuggestions(
        response.body.features.map((feature) => ({
          place_name: feature.place_name,
          center: feature.center as [number, number],
        }))
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: {
    place_name: string;
    center: [number, number];
  }) => {
    setValue("formatted_address", suggestion.place_name);
    setValue("latitude", suggestion.center[1]);
    setValue("longitude", suggestion.center[0]);
    setSuggestions([]);
  };

  useEffect(() => {
    if (noAddress) {
      setValue("formatted_address", null);
      setValue("latitude", null);
      setValue("longitude", null);
    }
  }, [noAddress, setValue]);

  return (
    <>
      <Controller
        name="no_address"
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="no_address"
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor="no_address">
              {`I don't have an address, please provide me one`}
            </Label>
          </div>
        )}
      />

      {!noAddress && (
        <div>
          <Label htmlFor="address">{`Address in ${config.cityName}`}</Label>
          <Controller
            name="formatted_address"
            control={control}
            render={({ field }) => (
              <div>
                <Input
                  id="address"
                  onChange={(e) => {
                    field.onChange(e);
                    handleAddressChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  value={field.value || ""}
                  name={field.name}
                  ref={field.ref}
                  placeholder={`Start typing an address in ${config.cityName}`}
                />
              </div>
            )}
          />
          {suggestions.length > 0 && (
            <ul className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

export function MapInfoForm({ initialData, targetUserId }: MapInfoFormProps) {
  const isError = initialData && "error" in initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<MapInfo>({
    resolver: zodResolver(mapInfoSchema),
    defaultValues: {
      user_id: targetUserId,
      formatted_address: isError
        ? null
        : initialData?.formatted_address || null,
      latitude: isError ? null : initialData?.latitude || null,
      longitude: isError ? null : initialData?.longitude || null,
      no_address: isError ? true : initialData?.no_address || false,
    },
  });

  useEffect(() => {
    form.reset(initialData as MapInfo);
  }, [initialData, form]);

  form.setValue("user_id", targetUserId);

  const onSubmit = createSubmitHandler<MapInfo>(
    `/api/users/participants/${targetUserId}/map-info`,
    async () => {
      toast({
        title: "Success",
        description: "Map info updated successfully.",
      });
      await mutate(`/api/users/participants/${targetUserId}/map-info`);
      router.refresh();
    },
    (error) => {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update Map info. Please try again. " + error,
        variant: "destructive",
      });
    },
    isError ? "POST" : "PUT"
  );

  const handleSubmit = async (values: MapInfo) => {
    setIsSubmitting(true);
    await onSubmit({ ...values, user_id: targetUserId! });
    setIsSubmitting(false);
  };

  const {
    formState: { errors },
  } = form;

  return (
    <FormProvider {...form}>
      <Card className="w-full max-w-[80%] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Map Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <input type="hidden" {...form.register("user_id")} />
            <FormFields />
            {errors.user_id && (
              <p className="text-red-500">{errors.user_id.message}</p>
            )}
            <div className="flex justify-between pt-6">
              <SaveChangesButton
                watchFields={[
                  "formatted_address",
                  "latitude",
                  "longitude",
                  "no_address",
                ]}
                isSubmitting={isSubmitting}
                label={
                  initialData
                    ? "Update map information"
                    : "Save map information"
                }
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
