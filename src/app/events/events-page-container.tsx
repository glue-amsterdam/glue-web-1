import SearchAndFilter from "@/app/components/events/search-and-filter-events";
import { EventModal } from "@/app/components/events/event-modal";

import EventHeader from "@/app/components/events/event-header";
import { Metadata } from "next";
import { Suspense } from "react";
import EventListContainer from "@/app/components/events/event-list-container";
import CenteredLoader from "@/app/components/centered-loader";

export const metadata: Metadata = {
  title: "GLUE - Events",
};

export default async function EventsPageContainer({
  params,
}: {
  params: URLSearchParams;
}) {
  return (
    <main className="relative z-10 pb-16">
      <div className="container mx-auto px-4">
        <EventHeader />
        <section aria-label="Event search and filters">
          <SearchAndFilter />
        </section>
        <Suspense fallback={<CenteredLoader />}>
          <EventListContainer params={params} />
        </Suspense>
        <EventModal />
      </div>
    </main>
  );
}
