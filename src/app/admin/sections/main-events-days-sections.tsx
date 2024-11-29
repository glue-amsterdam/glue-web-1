import EventDaysForm from "@/app/admin/forms/main-event-days-form";
import { fetchEventDays } from "@/utils/api/admin-api-calls";

export default async function MainEventsDaysSections() {
  const eventDays = await fetchEventDays();

  return <EventDaysForm initialData={eventDays} />;
}
