import EventsClientPage from "./events-client-page";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

export const metadata = {
  title: "GLUE Events",
  description: "Explore the events taking place at GLUE design routes.",
};



async function fetchHeaderTitle(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_settings")
      .select("header_title")
      .single();

    if (error || !data || !data.header_title) {
      return "Events";
    }

    return data.header_title;
  } catch (error) {
    console.error("Error fetching header title:", error);
    return "Events";
  }
}

export default async function EventsPage() {
  const headerTitle = await fetchHeaderTitle();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsClientPage headerTitle={headerTitle} />
    </Suspense>
  );
}
