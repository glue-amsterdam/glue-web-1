import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { fetchStickyParticipantCatalog } from "@/lib/admin/fetch-sticky-participant-catalog";
import { fetchStickyUserCatalog } from "@/lib/admin/fetch-sticky-user-catalog";
import { resolveStickyMembersByNames } from "@/lib/admin/resolve-sticky-member-by-name";

type ByNamesRequestBody = {
  names?: string[];
  selected_user_ids?: string[];
  selected_display_name_keys?: string[];
};

export async function POST(req: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as ByNamesRequestBody;
    const names = body.names ?? [];
    const selectedUserIds = body.selected_user_ids ?? [];
    const selectedDisplayNameKeys =
      body.selected_display_name_keys ??
      [];

    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json(
        { error: "names must be a non-empty array" },
        { status: 400 }
      );
    }

    const [participantCatalog, userCatalog] = await Promise.all([
      fetchStickyParticipantCatalog(auth.supabase),
      fetchStickyUserCatalog(auth.supabase),
    ]);

    const result = resolveStickyMembersByNames(
      names,
      participantCatalog,
      userCatalog,
      selectedUserIds,
      selectedDisplayNameKeys
    );

    return NextResponse.json(result);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
