import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// You'll need to install this package: npm install @mapbox/mapbox-sdk
import mapboxSdk from "@mapbox/mapbox-sdk/services/geocoding";

// Replace with your actual Mapbox access token
const mapboxClient = mapboxSdk({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string,
});

export const mapInfoSchema = z.object({
  formatted_address: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  no_address: z.boolean(),
});

export type MapInfoFormData = z.infer<typeof mapInfoSchema>;

interface MapInfoFormProps {
  onSubmit: (data: MapInfoFormData) => void;
  onBack: () => void;
}

export function MapInfoForm({ onSubmit, onBack }: MapInfoFormProps) {
  const [hasAddress, setHasAddress] = useState(true);
  const [suggestions, setSuggestions] = useState<
    Array<{ place_name: string; center: [number, number] }>
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MapInfoFormData>({
    resolver: zodResolver(mapInfoSchema),
    defaultValues: {
      no_address: false,
    },
  });

  const handleAddressChange = async (input: string) => {
    if (input.length > 2) {
      const response = await mapboxClient
        .forwardGeocode({
          query: input,
          limit: 5,
          countries: ["NL"],
          types: ["address"],
          bbox: [4.7287, 52.2784, 5.0679, 52.4311], // Bounding box for Amsterdam
          proximity: [4.9041, 52.3676], // Center of Amsterdam
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
    setValue("coordinates", suggestion.center);
    setSuggestions([]);
  };

  const handleNoAddressChange = (checked: boolean) => {
    setHasAddress(!checked);
    setValue("no_address", checked);
    if (checked) {
      setValue("formatted_address", undefined);
      setValue("coordinates", undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="no_address" className="flex items-center space-x-2">
          <Checkbox
            id="no_address"
            checked={!hasAddress}
            onCheckedChange={handleNoAddressChange}
          />
          <span>{`I don't have an address, please provide me one`}</span>
        </Label>
      </div>
      {hasAddress && (
        <div>
          <Label htmlFor="address">Address in Amsterdam</Label>
          <Input
            id="address"
            {...register("formatted_address")}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Start typing an address in Amsterdam"
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
        <Button type="submit">Next: Account Information</Button>
      </div>
    </form>
  );
}
