"use client";

import { useState, useEffect } from "react";
import { IndividualEventResponse } from "@/schemas/eventSchemas";
import EventsList from "./events-list";

export default function LazyEventsList({
  events,
  searchParams,
}: {
  events: IndividualEventResponse[];
  searchParams: { [key: string]: string };
}) {
  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    const search = searchParams.search;
    if (search) {
      filterEvents(search, events);
    } else {
      setFilteredEvents(events);
    }
  }, [events, searchParams]);

  const filterEvents = (
    searchTerm: string,
    eventList: IndividualEventResponse[]
  ) => {
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = eventList.filter(
      (event) =>
        event.name.toLowerCase().includes(lowercasedSearch) ||
        event.description.toLowerCase().includes(lowercasedSearch) ||
        event.organizer.user_name.toLowerCase().includes(lowercasedSearch) ||
        event.coOrganizers?.some((co) =>
          co.user_name.toLowerCase().includes(lowercasedSearch)
        )
    );
    setFilteredEvents(filtered);
  };

  return <EventsList events={filteredEvents} />;
}
