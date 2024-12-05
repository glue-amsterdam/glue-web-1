import { useState, useEffect } from "react";
import { fetchEventById, fetchMapById } from "@/utils/api";
import { IndividualEventResponse } from "@/schemas/eventSchemas";
import { MapLocationEnhaced } from "@/schemas/mapSchema";

export function useEventData(eventId: string | null) {
  const [event, setEvent] = useState<IndividualEventResponse | null>(null);
  const [mapData, setMapData] = useState<MapLocationEnhaced | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setMapData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const eventData = await fetchEventById(eventId);
        if (isMounted) setEvent(eventData);

        if (eventData.organizer.map_id) {
          const mapLocationData = await fetchMapById(
            eventData.organizer.map_id
          );
          if (isMounted) setMapData(mapLocationData);
        } else {
          if (isMounted) setMapData(null);
        }
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  return { event, mapData, isLoading, error };
}
