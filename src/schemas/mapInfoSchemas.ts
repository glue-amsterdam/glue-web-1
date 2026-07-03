import { z } from "zod";

export type MapInfoLocationFields = {
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  no_address: boolean | null;
};

export const refineMapInfoLocation = (
  data: MapInfoLocationFields,
  ctx: z.RefinementCtx
) => {
  if (data.no_address) {
    return;
  }

  if (!data.formatted_address?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Please select a location or indicate that you don't have one",
      path: ["formatted_address"],
    });
    return;
  }

  if (data.latitude == null || data.longitude == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select an address from the suggestions",
      path: ["formatted_address"],
    });
  }
};

export type MapInfoLocationInput = {
  formatted_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  no_address?: boolean | null;
};

export const mapInfoFieldsFromData = (
  data: MapInfoLocationInput
): MapInfoLocationFields => ({
  formatted_address: data.formatted_address ?? null,
  latitude: data.latitude ?? null,
  longitude: data.longitude ?? null,
  no_address: data.no_address ?? false,
});

export const mapInfoFieldsSchema = z.object({
  user_id: z.string().uuid().optional(),
  formatted_address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  no_address: z.boolean().nullable().default(false),
  exhibition_space_preference: z.string().nullable().optional(),
});

export const mapInfoSchema = mapInfoFieldsSchema.superRefine((data, ctx) =>
  refineMapInfoLocation(mapInfoFieldsFromData(data), ctx)
);

export type MapInfoInput = z.input<typeof mapInfoSchema>;
export type MapInfo = z.output<typeof mapInfoSchema>;
