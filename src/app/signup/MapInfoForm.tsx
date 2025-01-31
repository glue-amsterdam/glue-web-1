import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import mapboxSdk from "@mapbox/mapbox-sdk/services/geocoding";
import { MapInfo, mapInfoSchema } from "@/schemas/mapInfoSchemas";
import { config } from "@/env";
import { strToNumber } from "@/constants";

const mapboxClient = mapboxSdk({
  accessToken: config.mapboxAccesToken,
});

interface MapInfoFormProps {
  onSubmit: (data: MapInfo) => void;
  onBack: () => void;
}

export function MapInfoForm({ onSubmit, onBack }: MapInfoFormProps) {
  const [suggestions, setSuggestions] = useState<
    Array<{ place_name: string; center: [number, number] }>
  >([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MapInfo>({
    resolver: zodResolver(mapInfoSchema),
    defaultValues: {
      no_address: false,
    },
  });

  const westLimit = strToNumber(config.cityBoundWest);
  const southLimit = strToNumber(config.cityBoundSouth);
  const eastLimit = strToNumber(config.cityBoundEast);
  const northLimit = strToNumber(config.cityBoundNorth);

  const centerLng = strToNumber(config.cityCenterLng);
  const centerLat = strToNumber(config.cityCenterLat);

  const hasAddress = !watch("no_address");

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

  const handleNoAddressChange = (checked: boolean) => {
    setValue("no_address", checked);
    if (checked) {
      setValue("formatted_address", null);
      setValue("latitude", null);
      setValue("longitude", null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="no_address"
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="no_address"
              checked={field.value || false}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                handleNoAddressChange(checked as boolean);
              }}
            />
            <Label htmlFor="no_address">
              {`I don't have an address, please provide me one`}
            </Label>
          </div>
        )}
      />
      {hasAddress && (
        <div>
          <Label htmlFor="address">{` Address in ${config.cityName}`}</Label>
          <Controller
            name="formatted_address"
            control={control}
            render={({ field }) => (
              <Input
                id="address"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  handleAddressChange(e.target.value);
                }}
                value={field.value ?? ""}
                placeholder={`Start typing an address in ${config.cityName}`}
              />
            )}
          />
          {errors.formatted_address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formatted_address.message}
            </p>
          )}
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
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-[var(--color-box1)] hover:bg-[var(--color-box1)] hover:opacity-75"
          type="submit"
        >
          Next: Account Information
        </Button>
      </div>
    </form>
  );
}
