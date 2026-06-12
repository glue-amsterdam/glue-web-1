import type { SupabaseClient } from "@supabase/supabase-js";

export const EVENT_HEADER_CACHE_TAG = "event-header-title";

export const DEFAULT_EVENT_HEADER_TITLE = "Events";

export type EventHeaderTitle = {
  header_title: string;
};

export const fetchEventHeaderTitle = async (
  supabase: SupabaseClient
): Promise<EventHeaderTitle> => {
  const { data, error } = await supabase
    .from("event_settings")
    .select("header_title")
    .single();

  if (error || !data) {
    return { header_title: DEFAULT_EVENT_HEADER_TITLE };
  }

  return {
    header_title: data.header_title || DEFAULT_EVENT_HEADER_TITLE,
  };
};
