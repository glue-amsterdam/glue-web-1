import { config } from "@/config";

export type GeocodeSuggestion = {
  place_name: string;
  center: [number, number];
};

export type ForwardGeocodeOptions = {
  query: string;
  limit?: number;
  countries?: string[];
  types?: string[];
  bbox?: [number, number, number, number];
  proximity?: [number, number];
};

export const forwardGeocode = async (
  options: ForwardGeocodeOptions
): Promise<GeocodeSuggestion[]> => {
  const { query, limit = 5, countries, types, bbox, proximity } = options;

  if (query.length <= 2) {
    return [];
  }

  const params = new URLSearchParams({
    access_token: config.mapboxAccesToken,
    limit: String(limit),
    autocomplete: "true",
  });

  if (countries?.length) {
    params.set("country", countries.join(","));
  }

  if (types?.length) {
    params.set("types", types.join(","));
  }

  if (bbox) {
    params.set("bbox", bbox.join(","));
  }

  if (proximity) {
    params.set("proximity", proximity.join(","));
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    features?: Array<{ place_name: string; center: [number, number] }>;
  };

  return (data.features ?? []).map((feature) => ({
    place_name: feature.place_name,
    center: feature.center,
  }));
};
