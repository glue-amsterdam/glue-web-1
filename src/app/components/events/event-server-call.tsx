import { cache } from "react";
import { fetchEventById, fetchMapById } from "@/utils/api";
import EventContent from "./event-content";

const getEventData = cache(async (eventId: string) => {
  const event = await fetchEventById(eventId);
  const mapData = await fetchMapById(event.organizer.map_id);
  return { event, mapData };
});

export default async function EventServerComponent({
  eventId,
}: {
  eventId: string;
}) {
  const { event, mapData } = await getEventData(eventId);

  return <EventContent event={event} mapData={mapData} />;
}
