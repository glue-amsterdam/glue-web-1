import { getParticipantInheritedHubs } from "@/lib/numbers/get-participant-inherited-hubs";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const modCheck = await requirePlatformMod();
  if (!modCheck.ok) {
    return modCheck.response;
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const hubs = await getParticipantInheritedHubs(supabase, userId);

  return NextResponse.json({ hubs });
}
