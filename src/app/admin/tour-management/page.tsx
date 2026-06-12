import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchEventDays } from "@/lib/events/fetch-events-admin";
import TourManagementPage from "@/components/admin/tour-management/TourManagementPage";

export default async function TourManagementSectionPage() {
  await getAdminSupabaseOrRedirect();
  const { eventDays } = await fetchEventDays();

  return <TourManagementPage initialEventDays={eventDays} />;
}
