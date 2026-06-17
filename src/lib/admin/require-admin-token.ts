import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminAuthSuccess = {
  ok: true;
  supabase: SupabaseClient;
};

type AdminAuthFailure = {
  ok: false;
  response: NextResponse;
};

export const requireAdminToken = async (): Promise<
  AdminAuthSuccess | AdminAuthFailure
> => {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_token")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 403 }),
    };
  }

  return { ok: true, supabase: createAdminClient() };
};
