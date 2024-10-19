import React, { Suspense } from "react";
import SearchAndFilter from "../components/events/search-and-filter-events";
import { EventModal } from "../components/events/event-modal";
import { fetchEvents } from "@/utils/api";
import EventsList from "../components/events/events-list";
import EventHeader from "../components/events/event-header";
import CenteredLoader from "../components/centered-loader";
import { Metadata } from "next";
import Background from "../components/background";

export const metadata: Metadata = {
  title: "GLUE - Events",
};

export default async function Component({
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
    <div className="min-h-screen relative">
      <Background />
      <main className="relative z-10pb-16">
        <div className="container mx-auto px-4">
          <EventHeader />
          <section aria-label="Event search and filters">
            <SearchAndFilter />
          </section>
          <section aria-label="Event list">
            <Suspense fallback={<CenteredLoader />}>
              <EventsList events={events} />
            </Suspense>
          </section>
          <EventModal />
        </div>
      </main>
    </div>
  );
}
