"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { fetchEventsClient } from "@/utils/api";
import CenteredLoader from "@/app/components/centered-loader";
import { IndividualEventResponse } from "@/schemas/eventSchemas";

const LazyEventsList = dynamic(
  () => import("@/app/components/events/lazy-events-list"),
  {
    loading: () => <CenteredLoader />,
  }
);

export default function EventListContainer({
  params,
}: {
  params: URLSearchParams;
}) {
  const [events, setEvents] = useState<IndividualEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFilterKeyRef = useRef<string>("");

  // Extraer SOLO los parámetros de filtros (excluyendo eventId)
  const filterParams = useMemo(() => {
    // Asegurar que params sea URLSearchParams
    const searchParams =
      params instanceof URLSearchParams ? params : new URLSearchParams(params);

    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const day = searchParams.get("day") || "";
    return { search, type, day };
  }, [params]);

  // Crear una clave única SOLO para los filtros
  const filterKey = useMemo(() => {
    return `${filterParams.search}|${filterParams.type}|${filterParams.day}`;
  }, [filterParams]);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiParams = new URLSearchParams();
      // Solo incluir parámetros de filtros en la API
      if (filterParams.search) apiParams.set("search", filterParams.search);
      if (filterParams.type) apiParams.set("type", filterParams.type);
      if (filterParams.day) apiParams.set("day", filterParams.day);

      const eventsData = await fetchEventsClient(apiParams);
      console.log(
        "EventListContainer: Events loaded successfully:",
        eventsData.length
      );
      setEvents(eventsData);
      lastFilterKeyRef.current = filterKey;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }, [filterParams, filterKey]);

  useEffect(() => {
    // Solo cargar eventos si los filtros realmente cambiaron
    if (filterKey !== lastFilterKeyRef.current) {
      console.log("EventListContainer: Loading events for filters:", filterKey);
      loadEvents();
    }
  }, [filterKey, loadEvents]);

  if (loading) {
    return (
      <section aria-label="Event list">
        <CenteredLoader />
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Event list">
        <div className="text-center text-red-500 p-4">
          Error loading events: {error}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Event list">
      <LazyEventsList events={events} searchParams={filterParams} />
    </section>
  );
}
