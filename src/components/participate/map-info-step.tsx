"use client";

import BigButton from "@/components/big-button";
import { MapInfoFields } from "@/components/participate/map-info-fields";
import { MapInfo, MapInfoInput, mapInfoSchema } from "@/schemas/mapInfoSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
  submitLabel = "Next Step",
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
      className="max-w-[508px] lg:max-w-[1045px] mx-auto pt-[40px] lg:pt-[60px] pb-[15px] lg:pb-[30px]"
      noValidate
    >
      <MapInfoFields control={control} setValue={setValue} errors={errors} />
      <div className="flex justify-between pt-[30px] gap-4">
        <button
          type="button"
          onClick={onBack}
          className="base-text-size text-left hover:underline cursor-pointer"
        >
          Back
        </button>
        <BigButton as="submit" label={submitLabel} mode="navbar" />
      </div>
    </form>
  );
};
