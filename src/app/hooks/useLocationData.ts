import type { PopupInfo } from "@/app/map/map-component";
import useSWR from "swr";

// Create a cache for location data
const locationCache = new Map<string, PopupInfo>();

// Default empty location data
const defaultLocationData: PopupInfo = {
  id: "",
  formatted_address: "",
  latitude: 0,
  longitude: 0,
  is_hub: false,
  is_collective: false,
  is_special_program: false,
  hub_name: null,
  hub_description: null,
  participants: [],
};

const fetcher = async (url: string) => {
  const locationId = url.split("/").pop();

  // Check if we have cached data
  if (locationId && locationCache.has(locationId)) {
    return locationCache.get(locationId) || defaultLocationData;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      // Add cache control headers
      headers: {
        "Cache-Control": "max-age=3600", // Cache for 1 hour
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch location data: ${response.status} ${response.statusText}`
      );
    }

    const data: PopupInfo = await response.json();

    // Validate required fields in the response
    if (!data.longitude || !data.latitude) {
      throw new Error(
        "Invalid location data received: Missing required fields"
      );
    }

    // Cache the data
    if (locationId) {
      locationCache.set(locationId, data);
    }

    return data || defaultLocationData;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
};

export function useLocationData(locationId: string | null) {
  const { data, error, isLoading } = useSWR<PopupInfo>(
    locationId ? `/api/mapbox/location/${locationId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Increase deduping interval to 1 minute
      shouldRetryOnError: true,
      errorRetryCount: 2, // Reduce retry count
      errorRetryInterval: 3000, // Reduce retry interval
      fallbackData:
        locationId && locationCache.has(locationId)
          ? locationCache.get(locationId)
          : defaultLocationData,
    }
  );

  return {
    locationData: data || defaultLocationData,
    isLoading: isLoading && !locationCache.has(locationId || ""),
    isError: !!error,
    error: error?.message || null,
  };
}
