import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseSchema = process.env.SUPABASE_SCHEMA || "public";

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!, {
    db: {
      schema: supabaseSchema,
    },
  });
}
