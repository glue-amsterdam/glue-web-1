import * as z from "zod";

export const routeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(60, "It should be a brief description, maximum 60 characters"),
  dots: z
    .array(
      z.object({
        mapbox_id: z.string(),
        place_name: z.string(),
        user_id: z.string(),
      })
    )
    .min(2, "At least 2 location must be selected"),
});

export type RouteValues = z.infer<typeof routeSchema>;
export type RouteValuesEnhanced = RouteValues & { id: string };

export type MapLocationEnhaced = {
  mapbox_id: string;
  user_id: string;
  place_name: string;
};

export interface MapBoxPlace {
  id: string /* FOREING KEY */;
  text: string;
  place_name: string;
  center: [number, number];
  context: LocationContext[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: number;
  title: string;
  content: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface LocationGroup {
  id: string;
  title: string;
  protected: boolean;
  locations: Location[];
}

interface LocationContext {
  id: string;
  text: string;
  short_code?: string;
}
