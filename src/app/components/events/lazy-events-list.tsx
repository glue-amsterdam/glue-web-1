"use client";

import { useMemo, useCallback, memo } from "react";
import { IndividualEventResponse } from "@/schemas/eventSchemas";
import EventsList from "./events-list";

const LazyEventsList = memo(function LazyEventsList({
  events,
  searchParams,
}: {
  events: IndividualEventResponse[];
  searchParams: { [key: string]: string };
}) {
  const filterEvents = useCallback(
    (searchTerm: string, eventList: IndividualEventResponse[]) => {
      const lowercasedSearch = searchTerm.toLowerCase();
      return eventList.filter(
        (event) =>
          event.name.toLowerCase().includes(lowercasedSearch) ||
          event.description.toLowerCase().includes(lowercasedSearch) ||
          event.organizer.user_name.toLowerCase().includes(lowercasedSearch) ||
          event.coOrganizers?.some((co) =>
            co.user_name.toLowerCase().includes(lowercasedSearch)
          )
      );
    },
    []
  );

  const filteredEvents = useMemo(() => {
    const search = searchParams.search;
    if (search) {
      return filterEvents(search, events);
    } else {
      return events;
    }
  }, [events, searchParams.search, filterEvents]);

  return <EventsList events={filteredEvents} />;
});

export default LazyEventsList;
