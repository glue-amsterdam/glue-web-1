import { config } from "@/env";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client (bypasses RLS). Uses `@supabase/supabase-js` directly
 * so the organizer's browser session is never attached — `createServerClient` from SSR
 * would merge cookies and send the logged-in user's JWT, which makes RLS hide rows
 * (e.g. `visitor_data` for other users).
 */
export const createAdminClient = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  return createClient(config.supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
