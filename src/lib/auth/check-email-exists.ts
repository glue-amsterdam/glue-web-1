import { config } from "@/config";
import { createAdminClient } from "@/utils/supabase/adminClient";

const listAuthUsersByEmailFilter = async (
  normalizedEmail: string,
): Promise<boolean> => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    return false;
  }

  const url = new URL(`${config.supabaseUrl}/auth/v1/admin/users`);
  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", "1");
  url.searchParams.set("filter", normalizedEmail);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { users?: unknown[] };
  return (payload.users?.length ?? 0) > 0;
};

export const checkAuthUserExistsByEmail = async (
  normalizedEmail: string,
): Promise<boolean> => {
  const admin = createAdminClient();

  const { data: visitor } = await admin
    .from("visitor_data")
    .select("auth_user_id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (visitor?.auth_user_id) {
    return true;
  }

  return listAuthUsersByEmailFilter(normalizedEmail);
};
