import { z } from "zod";

export const mapInfoSchemaApiCall = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  formatted_address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  no_address: z.boolean().nullable().default(false),
  user_info: z.object({
    user_name: z.string(),
    visible_emails: z.array(z.string().email()).nullable(),
  }),
});

export type MapInfoAPICall = z.infer<typeof mapInfoSchemaApiCall>;

export const ZoneEnum = z.enum(["NORTH", "SOUTH", "EAST", "WEST"]);

export const routeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  zone: ZoneEnum,
  dots: z.array(
    z.object({
      ...mapInfoSchemaApiCall.shape,
      route_step: z.number(),
    })
  ),
});

export type RouteStep = MapInfoAPICall & { route_step: number };
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
