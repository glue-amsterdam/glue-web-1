import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type RequireModResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

export const requirePlatformMod = async (): Promise<RequireModResult> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const isModerator = await getIsPlatformMod(supabase, user.id);
  if (!isModerator) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id };
};
