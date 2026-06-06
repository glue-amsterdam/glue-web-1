"use client";

import { useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  UseFormSetValue,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { config } from "@/config";
import { strToNumber } from "@/constants";
import {
  forwardGeocode,
  type GeocodeSuggestion,
} from "@/lib/mapbox/forward-geocode";

type AddressFormFields = {
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
};

type AddressAutocompleteFieldProps<T extends FieldValues & AddressFormFields> =
  {
    control: Control<T>;
    setValue: UseFormSetValue<T>;
    label?: string;
    placeholder?: string;
    id?: string;
    error?: string;
    className?: string;
  };

export const AddressAutocompleteField = <
  T extends FieldValues & AddressFormFields,
>({
  control,
  setValue,
  label = "Location to present during GLUE",
  placeholder = `Start typing an address in ${config.cityName}`,
  id = "address",
  error,
  className,
}: AddressAutocompleteFieldProps<T>) => {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);

  const westLimit = strToNumber(config.cityBoundWest);
  const southLimit = strToNumber(config.cityBoundSouth);
  const eastLimit = strToNumber(config.cityBoundEast);
  const northLimit = strToNumber(config.cityBoundNorth);
  const centerLng = strToNumber(config.cityCenterLng);
  const centerLat = strToNumber(config.cityCenterLat);

  const handleAddressChange = async (input: string) => {
    if (input.length > 2) {
      const features = await forwardGeocode({
        query: input,
        limit: 5,
        countries: [config.countryPreFix],
        types: ["address"],
        bbox: [westLimit, southLimit, eastLimit, northLimit],
        proximity: [centerLng, centerLat],
      });

      setSuggestions(features);
      return;
    }

    setSuggestions([]);
  };

  const handleSuggestionSelect = (suggestion: GeocodeSuggestion) => {
    setValue("formatted_address" as Path<T>, suggestion.place_name as T[Path<T>]);
    setValue("latitude" as Path<T>, suggestion.center[1] as T[Path<T>]);
    setValue("longitude" as Path<T>, suggestion.center[0] as T[Path<T>]);
    setSuggestions([]);
  };

  const handleSuggestionKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    suggestion: GeocodeSuggestion
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleSuggestionSelect(suggestion);
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Controller
        name={"formatted_address" as Path<T>}
        control={control}
        render={({ field }) => (
          <Input
            id={id}
            onChange={(event) => {
              field.onChange(event);
              void handleAddressChange(event.target.value);
            }}
            onBlur={field.onBlur}
            value={(field.value as string | null) ?? ""}
            name={field.name}
            ref={field.ref}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-controls={suggestions.length > 0 ? `${id}-suggestions` : undefined}
            aria-expanded={suggestions.length > 0}
          />
        )}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
      {suggestions.length > 0 && (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          aria-label="Address suggestions"
          className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.place_name}-${index}`}
              role="option"
              tabIndex={0}
              aria-label={suggestion.place_name}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionSelect(suggestion)}
              onKeyDown={(event) => handleSuggestionKeyDown(event, suggestion)}
            >
              {suggestion.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
