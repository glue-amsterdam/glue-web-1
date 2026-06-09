import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MapInfo, mapInfoSchema } from "@/schemas/mapInfoSchemas";
import { AddressAutocompleteField } from "@/components/map/address-autocomplete-field";

interface MapInfoFormProps {
  onSubmit: (data: MapInfo) => void;
  onBack: () => void;
  defaultValues?: Partial<MapInfo>;
  submitLabel?: string;
}

export function MapInfoForm({
  onSubmit,
  onBack,
  defaultValues,
  submitLabel = "Next Step",
}: MapInfoFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MapInfo>({
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

  const hasAddress = !watch("no_address");

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
              {`I don't have a location to present during GLUE, please provide me one`}
            </Label>
          </div>
        )}
      />
      {hasAddress && (
        <AddressAutocompleteField
          control={control}
          setValue={setValue}
          error={errors.formatted_address?.message}
        />
      )}
      <div>
        <Label htmlFor="exhibition_space_preference">
          What sort of exhibition space would you like to have?
        </Label>
        <Controller
          name="exhibition_space_preference"
          control={control}
          render={({ field }) => (
            <Textarea
              id="exhibition_space_preference"
              {...field}
              value={field.value ?? ""}
              placeholder="Describe your preferred exhibition space (optional)"
              className="mt-1 min-h-[100px]"
            />
          )}
        />
        {errors.exhibition_space_preference && (
          <p className="text-red-500 text-sm mt-1">
            {errors.exhibition_space_preference.message}
          </p>
        )}
      </div>
      <div className="flex justify-between gap-2 flex-wrap">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-[var(--color-box1)] hover:bg-[var(--color-box1)] hover:opacity-75 text-pretty h-fit"
          type="submit"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
