import { fetchEventById } from "@/utils/api";
import EventContent from "./event-content";

export default async function EventServerComponent({
  eventId,
}: {
  eventId: string;
}) {
  const event = await fetchEventById(eventId);
  return <EventContent event={event} />;
}
