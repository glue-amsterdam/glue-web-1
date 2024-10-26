import EventsList from "@/app/components/events/events-list";
import { fetchEvents } from "@/utils/api";

async function EventListContainer({ params }: { params: URLSearchParams }) {
  const { events } = await fetchEvents(params);
  return (
    <section aria-label="Event list">
      <EventsList events={events} />
    </section>
  );
}

export default EventListContainer;
