import { PopupInfo } from "@/app/map/map-component";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
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

    return data;
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
      dedupingInterval: 10000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    locationData: data,
    isLoading,
    isError: !!error,
    error: error?.message || null,
  };
}
