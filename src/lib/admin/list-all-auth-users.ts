import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthUserSummary = {
  id: string;
  email: string | null;
  created_at: string;
};

const PER_PAGE = 1000;

export const listAllAuthUsers = async (
  admin: SupabaseClient
): Promise<AuthUserSummary[]> => {
  const users: AuthUserSummary[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: PER_PAGE,
    });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const batch = data.users.map((user) => ({
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at,
    }));

    users.push(...batch);

    if (batch.length < PER_PAGE) {
      break;
    }

    page += 1;
  }

  return users;
};
