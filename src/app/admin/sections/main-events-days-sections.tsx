import EventDaysForm from "@/app/admin/forms/main-event-days-form";
import { fetchEventDays } from "@/lib/admin/main/fetch-event-days";

export default async function MainEventsDaysSections() {
  const eventDays = await fetchEventDays();

  return <EventDaysForm initialData={eventDays} />;
}
