import { config } from "@/env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    config.supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,

    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
