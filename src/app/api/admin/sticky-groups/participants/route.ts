import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { fetchStickyParticipantCatalog } from "@/lib/admin/fetch-sticky-participant-catalog";

type StickyMembershipRow = {
  participant_user_id: string;
  sticky_groups: { year: number } | { year: number }[] | null;
};

export async function GET() {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const supabase = auth.supabase;

    const [catalog, stickyMembershipResult] = await Promise.all([
      fetchStickyParticipantCatalog(supabase),
      supabase
        .from("sticky_group_participants")
        .select("participant_user_id, sticky_groups(year)"),
    ]);

    if (stickyMembershipResult.error) throw stickyMembershipResult.error;

    const stickyYearsByUserId = new Map<string, number[]>();

    for (const row of stickyMembershipResult.data ?? []) {
      const membership = row as StickyMembershipRow;
      const groupData = membership.sticky_groups;
      const year = Array.isArray(groupData)
        ? groupData[0]?.year
        : groupData?.year;

      if (year == null) continue;

      const existing =
        stickyYearsByUserId.get(membership.participant_user_id) ?? [];
      existing.push(year);
      stickyYearsByUserId.set(membership.participant_user_id, existing);
    }

    const participants = catalog.map((participant) => ({
      user_id: participant.user_id,
      slug: participant.slug,
      display_name: participant.display_name,
      display_number: participant.display_number,
      user_name: participant.user_name,
      name: participant.name,
      status: participant.status,
      sticky_years: (stickyYearsByUserId.get(participant.user_id) ?? []).sort(
        (a, b) => a - b
      ),
    }));

    return NextResponse.json(participants);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
