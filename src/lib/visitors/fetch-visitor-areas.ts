import { createAdminClient } from "@/utils/supabase/adminClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export type VisitorArea = {
  id: string;
  name: string;
  created_at: string;
};

export const createAreaSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
});

export const fetchVisitorAreas = async (
  supabase?: SupabaseClient
): Promise<VisitorArea[]> => {
  const client = supabase ?? (await createAdminClient());
  const { data, error } = await client
    .from("visitor_areas")
    .select("id, name, created_at")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const createVisitorArea = async (
  name: string,
  supabase?: SupabaseClient
): Promise<VisitorArea> => {
  const client = supabase ?? (await createAdminClient());
  const parsed = createAreaSchema.parse({ name });

  const { data, error } = await client
    .from("visitor_areas")
    .insert({ name: parsed.name })
    .select("id, name, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A work area with this name already exists");
    }
    throw error;
  }

  return data;
};

export const updateVisitorArea = async (
  id: string,
  name: string,
  supabase?: SupabaseClient
): Promise<VisitorArea> => {
  const client = supabase ?? (await createAdminClient());
  const parsed = createAreaSchema.parse({ name });

  const { data, error } = await client
    .from("visitor_areas")
    .update({ name: parsed.name })
    .eq("id", id)
    .select("id, name, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A work area with this name already exists");
    }
    throw error;
  }

  return data;
};

export const deleteVisitorArea = async (
  id: string,
  supabase?: SupabaseClient
): Promise<void> => {
  const client = supabase ?? (await createAdminClient());
  const { error } = await client.from("visitor_areas").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
