import { cookies } from "next/headers";
import { createAdminClient } from "@/utils/supabase/adminClient";
import type { SupabaseClient } from "@supabase/supabase-js";

class AdminUnauthorizedError extends Error {
  constructor(message = "Unauthorized: Admin access required") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

export const requireAdmin = async (): Promise<SupabaseClient> => {
  const cookieStore = await cookies();

  if (!cookieStore.get("admin_token")) {
    throw new AdminUnauthorizedError();
  }

  return createAdminClient();
};
