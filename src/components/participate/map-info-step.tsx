"use client";

import BigButton from "@/components/big-button";
import { MapInfoFields } from "@/components/participate/map-info-fields";
import { MapInfoInput, mapInfoSchema, type MapInfo } from "@/schemas/mapInfoSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Control, type UseFormSetValue } from "react-hook-form";

type MapInfoStepProps = {
  onSubmit: (data: MapInfo) => void;
  onBack: () => void;
  defaultValues?: Partial<MapInfo>;
  submitLabel?: string;
};

export const MapInfoStep = ({
  onSubmit,
  onBack,
  defaultValues,
  submitLabel = "next step",
}: MapInfoStepProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MapInfoInput, unknown, MapInfo>({
    resolver: zodResolver(mapInfoSchema),
    defaultValues: {
      no_address: defaultValues?.no_address ?? false,
      formatted_address: defaultValues?.formatted_address ?? null,
      latitude: defaultValues?.latitude ?? null,
      longitude: defaultValues?.longitude ?? null,
      exhibition_space_preference:
        defaultValues?.exhibition_space_preference ?? null,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-(--field-max-width) lg:max-w-[1045px] mx-auto title-padding pb-[15px] lg:pb-[30px]"
      noValidate
    >
      <MapInfoFields
        control={control as unknown as Control<MapInfoInput>}
        setValue={setValue as unknown as UseFormSetValue<MapInfoInput>}
        errors={errors}
      />

      <div className="flex justify-between items-end pt-[30px] gap-4">
        <button
          type="button"
          onClick={onBack}
          className="body-text text-left cursor-pointer"
        >
          Back
        </button>
        <BigButton as="submit" label={submitLabel} mode="navbar" />
      </div>
    </form>
  );
};
