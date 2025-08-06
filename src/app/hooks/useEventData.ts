import useSWR from "swr";
import { IndividualEventWithMapResponse } from "@/schemas/eventSchemas";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "An error occurred while fetching the data."
    );
  }
  return res.json();
};

export function useEventData(eventId: string | null) {
  const { data, error, isLoading } = useSWR<IndividualEventWithMapResponse>(
    eventId ? `/api/events/${eventId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0, // Disable automatic refresh
      dedupingInterval: 60000, // Dedupe requests within 1 minute
      keepPreviousData: true, // Keep previous data while loading new data
    }
  );

  return {
    event: data ? { ...data, mapData: undefined } : null, // Remove mapData from event object
    isLoading,
    error: error ? error : null,
  };
}
