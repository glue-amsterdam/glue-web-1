import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/adminClient";

export const getAdminSupabaseOrRedirect = async () => {
  const cookieStore = await cookies();

  if (!cookieStore.get("admin_token")) {
    redirect("/admin/login");
  }

  return createAdminClient();
};
