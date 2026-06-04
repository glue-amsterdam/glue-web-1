import { createClient } from "@supabase/supabase-js";
import { config } from "@/config";

/** Anonymous Supabase client without cookies — safe inside unstable_cache. */
export const createPublicSupabaseClient = () =>
  createClient(config.supabaseUrl, config.supabaseAnonKey);
