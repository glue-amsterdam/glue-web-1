import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchEventHeaderTitle } from "@/lib/events/fetch-events-admin";
import EventsClientPage from "@/components/admin/events/EventsClientPage";

export default async function EventsSectionPage() {
  await getAdminSupabaseOrRedirect();
  const headerTitle = await fetchEventHeaderTitle();

  return (
    <EventsClientPage
      initialHeaderTitle={{
        header_title: headerTitle.header_title || "Events",
      }}
    />
  );
}
