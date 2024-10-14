import React, { Suspense } from "react";
import BackgroundGrid from "../components/background-grid";
import LogoMain from "../components/home-page/logo-main";
import SearchAndFilter from "../components/events/search-and-filter-events";
import { EventModal } from "../components/events/event-modal";
import { fetchEvents } from "@/utils/api";
import EventsList from "../components/events/events-list";
import EventHeader from "../components/events/event-header";

export default async function EventPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.append(key, value.toLowerCase());
    }
  });

  const { events } = await fetchEvents(params);
  return (
    <div className="fixed inset-0 overflow-y-scroll">
      <main className="container mt-[15vh] relative mx-auto px-4 py-8 z-10">
        <EventHeader />
        <section aria-label="Event search and filters">
          <SearchAndFilter />
        </section>
        <section aria-label="Event list">
          <Suspense fallback={<div>Loading events...</div>}>
            <EventsList events={events} />
          </Suspense>
        </section>

        <EventModal />
      </main>
      <Background />
    </div>
  );
}
function Background() {
  return (
    <div className="fixed inset-0">
      <LogoMain />
      <BackgroundGrid />
    </div>
  );
}
