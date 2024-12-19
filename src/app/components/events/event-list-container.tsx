import { Suspense } from "react";
import dynamic from "next/dynamic";
import { fetchEvents } from "@/utils/api";
import CenteredLoader from "@/app/components/centered-loader";

const LazyEventsList = dynamic(
  () => import("@/app/components/events/lazy-events-list"),
  {
    loading: () => <CenteredLoader />,
  }
);

async function EventListContainer({ params }: { params: URLSearchParams }) {
  const events = await fetchEvents(params);

  return (
    <section aria-label="Event list">
      <Suspense fallback={<CenteredLoader />}>
        <LazyEventsList
          events={events}
          searchParams={Object.fromEntries(params)}
        />
      </Suspense>
    </section>
  );
}

export default EventListContainer;
