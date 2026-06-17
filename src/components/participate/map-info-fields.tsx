"use client";

import { useEffect } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { AddressAutocompleteField } from "@/components/map/address-autocomplete-field";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import type { MapInfo, MapInfoInput } from "@/schemas/mapInfoSchemas";

type MapInfoFieldsProps = {
  control: Control<MapInfoInput>;
  setValue: UseFormSetValue<MapInfoInput>;
  errors?: FieldErrors<MapInfo>;
  className?: string;
  readOnly?: boolean;
};

export const MapInfoFields = ({
  control,
  setValue,
  errors,
  className = "",
  readOnly = false,
}: MapInfoFieldsProps) => {
  const noAddress = useWatch({ control, name: "no_address" });

  useEffect(() => {
    if (noAddress) {
      setValue("formatted_address", null);
      setValue("latitude", null);
      setValue("longitude", null);
    }
  }, [noAddress, setValue]);

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-[15px] lg:gap-[30px] ${className}`}
    >
      <Controller
        name="no_address"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-2 lg:col-span-2">
            <input
              type="checkbox"
              id="no_address"
              checked={field.value || false}
              onChange={(event) => field.onChange(event.target.checked)}
              disabled={readOnly}
              className="size-[12px] shrink-0 border border-(--black-color) accent-(--primary-color) disabled:opacity-60"
            />
            <label
              htmlFor="no_address"
              className={readOnly ? "cursor-default" : "cursor-pointer"}
            >
              {`I don't have a location to present during GLUE, please provide me one`}
            </label>
          </div>
        )}
      />

      {!noAddress ? (
        <AddressAutocompleteField
          control={control}
          setValue={setValue}
          error={errors?.formatted_address?.message}
          wrapperClassName="lg:col-span-2"
          disabled={readOnly}
        />
      ) : null}

      <Controller
        name="exhibition_space_preference"
        control={control}
        render={({ field }) => (
          <ParticipateFormField
            label="What sort of exhibition space would you like to have?"
            name="exhibition_space_preference"
            as="textarea"
            value={field.value ?? ""}
            onChange={field.onChange}
            error={errors?.exhibition_space_preference?.message}
            placeholder="Describe your preferred exhibition space (optional)"
            wrapperClassName="lg:col-span-2"
            disabled={readOnly}
          />
        )}
      />
    </div>
  );
};
