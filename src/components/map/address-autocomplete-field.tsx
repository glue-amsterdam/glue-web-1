"use client";

import { useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  UseFormSetValue,
} from "react-hook-form";
import { config } from "@/config";
import { strToNumber } from "@/constants";
import {
  forwardGeocode,
  type GeocodeSuggestion,
} from "@/lib/mapbox/forward-geocode";
import { participateFieldClassName } from "@/components/participate/participate-form-field";

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
    wrapperClassName?: string;
    disabled?: boolean;
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
  wrapperClassName,
  disabled = false,
}: AddressAutocompleteFieldProps<T>) => {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);

  const westLimit = strToNumber(config.cityBoundWest);
  const southLimit = strToNumber(config.cityBoundSouth);
  const eastLimit = strToNumber(config.cityBoundEast);
  const northLimit = strToNumber(config.cityBoundNorth);
  const centerLng = strToNumber(config.cityCenterLng);
  const centerLat = strToNumber(config.cityCenterLat);

  const handleAddressChange = async (input: string) => {
    if (disabled) return;

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
    <div
      className={`flex flex-col gap-[10px] ${wrapperClassName ?? ""} ${className ?? ""}`}
    >
      <label htmlFor={id} className="base-text-size">
        {label}
      </label>
      <div className="relative">
        {error ? (
          <span
            id={`${id}-error`}
            role="alert"
            className="pointer-events-none absolute bottom-full left-0 right-0 mb-[4px] text-[12px] leading-[14px] text-(--primary-color) line-clamp-2"
          >
            {error}
          </span>
        ) : null}
        <Controller
          name={"formatted_address" as Path<T>}
          control={control}
          render={({ field }) => (
            <input
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
              disabled={disabled}
              aria-autocomplete="list"
              aria-controls={
                suggestions.length > 0 ? `${id}-suggestions` : undefined
              }
              aria-expanded={suggestions.length > 0}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              className={`${participateFieldClassName} h-[42px] disabled:opacity-60`}
            />
          )}
        />
      </div>
      {suggestions.length > 0 ? (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          aria-label="Address suggestions"
          className="bg-(--white-color) border border-(--black-color)"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.place_name}-${index}`}
              role="option"
              tabIndex={0}
              aria-label={suggestion.place_name}
              className="px-3 py-2 base-text-size hover:bg-(--primary-color)/10 cursor-pointer"
              onClick={() => handleSuggestionSelect(suggestion)}
              onKeyDown={(event) => handleSuggestionKeyDown(event, suggestion)}
            >
              {suggestion.place_name}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
