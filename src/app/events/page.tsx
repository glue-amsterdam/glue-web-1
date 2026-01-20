import EventsClientPage from "./events-client-page";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "GLUE Events",
  description: "Explore the events taking place at GLUE design routes.",
};

// Revalidation happens immediately via revalidatePath in the admin API when title is updated
// No time-based revalidation needed since updates trigger immediate revalidation

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

export default async function EventsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.append(key, value.toLowerCase());
    }
  });

  const headerTitle = await fetchHeaderTitle();

  return <EventsClientPage params={params} headerTitle={headerTitle} />;
}
