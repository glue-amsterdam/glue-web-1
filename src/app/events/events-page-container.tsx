import SearchAndFilter from "@/app/components/events/search-and-filter-events";
import { EventModal } from "@/app/components/events/event-modal";
import { fetchEvents } from "@/utils/api";
import EventsList from "@/app/components/events/events-list";
import EventHeader from "@/app/components/events/event-header";
import { Metadata } from "next";
import Background from "@/app/components/background";

export const metadata: Metadata = {
  title: "GLUE - Events",
};

export default async function EventsPageContainer({
  params,
}: {
  params: URLSearchParams;
}) {
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
            <EventsList events={events} />
          </section>
          <EventModal />
        </div>
      </main>
    </div>
  );
}
