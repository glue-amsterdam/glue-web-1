import { PopupInfo } from "@/app/map/map-component";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch location data: ${response.status} ${response.statusText}`
    );
  }
  const data: PopupInfo = await response.json();
  if (!data.longitude || !data.latitude) {
    throw new Error("Invalid location data received");
  }
  return data;
};

export function useLocationData(locationId: string | null) {
  const { data, error, isLoading } = useSWR<PopupInfo>(
    locationId ? `/api/mapbox/location/${locationId}` : null,
    fetcher
  );

  return {
    locationData: data,
    isLoading,
    isError: error,
  };
}
