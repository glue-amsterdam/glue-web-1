import { z } from "zod";

export const mapInfoSchemaApiCall = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  formatted_address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  no_address: z.boolean().nullable().default(false),
  display_name: z.string(),
});

export type MapInfoAPICall = z.infer<typeof mapInfoSchemaApiCall>;

export const routeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  route_zone_id: z.string().uuid("Zone is required"),
  dots: z.array(
    z.object({
      ...mapInfoSchemaApiCall.shape,
      route_step: z.number(),
      user_id: z.string().uuid(), // Add this line to include user_id
    })
  ),
});

export type RouteStep = MapInfoAPICall & {
  route_step: number;
  user_id: string;
};

export type RouteValues = z.infer<typeof routeSchema>;

export const routeApiCallSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  zone: z.string(),
  route_dots: z.array(
    z.object({
      id: z.string().uuid(),
      route_step: z.number(),
      user_id: z.string().uuid(), // Add this line to include user_id
      hub_id: z.string().uuid().nullable(), // Add this line to include hub_id
      map_info: z.object({
        id: z.string().uuid(),
        formatted_address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    })
  ),
});

export type RouteApiCall = z.infer<typeof routeApiCallSchema>;
