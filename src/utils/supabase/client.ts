import { config } from "@/env";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
}
