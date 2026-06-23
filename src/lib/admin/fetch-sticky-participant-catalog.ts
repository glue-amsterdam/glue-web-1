import type { SupabaseClient } from "@supabase/supabase-js";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";

export type StickyParticipantCatalogRow = {
  user_id: string;
  slug: string;
  display_name: string | null;
  display_number: string | null;
  user_name: string | null;
  name: string;
  status: string;
};

const PAGE_SIZE = 1000;

export const fetchStickyParticipantCatalog = async (
  supabase: SupabaseClient
): Promise<StickyParticipantCatalogRow[]> => {
  const participantRows: Array<{
    user_id: string;
    slug: string;
    display_name: string | null;
    display_number: string | null;
    status: string;
  }> = [];

  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("participant_details")
      .select("user_id, slug, display_name, display_number, status")
      .order("user_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;

    participantRows.push(...data);

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return participantRows.map((row) => {
    return {
      user_id: row.user_id,
      slug: row.slug,
      display_name: row.display_name,
      display_number: row.display_number,
      user_name: null,
      name: getParticipantDisplayName({
        display_name: row.display_name,
      }),
      status: row.status,
    };
  });
};
