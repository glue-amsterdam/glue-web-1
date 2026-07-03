import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapParticipantCategoryFromRow,
  type ParticipantCategory,
  type ParticipantCategoryDbRow,
} from "@/lib/participants/participant-categories";
import {
  participantCategoryUserFormSchema,
  slugifyParticipantCategoryLabel,
  type ParticipantCategoryUserFormData,
} from "@/schemas/participantCategorySchema";
import { createClient } from "@/utils/supabase/server";

/** Defaults for categories created by the client in admin */
const USER_CATEGORY_DEFAULTS = {
  is_default: false,
  is_structural: false,
  assignable: true,
  show_in_filters: true,
  is_protected: false,
} as const;

const categoryUserFieldsToDbRow = (data: ParticipantCategoryUserFormData) => ({
  label: data.label,
  bg_color: data.bgColor,
  font_color: data.fontColor,
  sort_order: data.sortOrder,
});

const ensureUniqueSlug = async (
  supabase: SupabaseClient,
  baseSlug: string,
  excludeId?: string
): Promise<string> => {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    let query = supabase
      .from("participant_categories")
      .select("id")
      .eq("slug", candidate);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

export const fetchParticipantCategoriesAdmin = async (
  supabase?: SupabaseClient
): Promise<ParticipantCategory[]> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("participant_categories")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return ((data ?? []) as ParticipantCategoryDbRow[]).map(
    mapParticipantCategoryFromRow
  );
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const fetchParticipantCategoryBySlug = async (
  slug: string,
  supabase?: SupabaseClient
): Promise<ParticipantCategory | null> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("participant_categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapParticipantCategoryFromRow(data as ParticipantCategoryDbRow);
};

export const fetchParticipantCategoryById = async (
  id: string,
  supabase?: SupabaseClient
): Promise<ParticipantCategory | null> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("participant_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapParticipantCategoryFromRow(data as ParticipantCategoryDbRow);
};

/** Resolves a category from either slug or legacy UUID URLs. */
export const fetchParticipantCategoryByRef = async (
  ref: string,
  supabase?: SupabaseClient
): Promise<ParticipantCategory | null> => {
  const bySlug = await fetchParticipantCategoryBySlug(ref, supabase);
  if (bySlug) return bySlug;

  if (!UUID_PATTERN.test(ref)) return null;

  return fetchParticipantCategoryById(ref, supabase);
};

export const createParticipantCategory = async (
  input: ParticipantCategoryUserFormData,
  supabase?: SupabaseClient
): Promise<ParticipantCategory> => {
  const client = supabase ?? (await createClient());
  const validated = participantCategoryUserFormSchema.parse(input);
  const baseSlug = slugifyParticipantCategoryLabel(validated.label);

  if (!baseSlug) {
    throw new Error("Could not generate a slug from the label");
  }

  const slug = await ensureUniqueSlug(client, baseSlug);

  const { data, error } = await client
    .from("participant_categories")
    .insert({
      slug,
      ...categoryUserFieldsToDbRow(validated),
      ...USER_CATEGORY_DEFAULTS,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapParticipantCategoryFromRow(data as ParticipantCategoryDbRow);
};

export const updateParticipantCategory = async (
  input: ParticipantCategoryUserFormData,
  supabase?: SupabaseClient
): Promise<ParticipantCategory> => {
  const client = supabase ?? (await createClient());
  const validated = participantCategoryUserFormSchema.parse(input);

  if (!validated.id) {
    throw new Error("Category id is required for update");
  }

  const { data: existing, error: fetchError } = await client
    .from("participant_categories")
    .select("*")
    .eq("id", validated.id)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await client
    .from("participant_categories")
    .update({
      ...categoryUserFieldsToDbRow(validated),
      updated_at: new Date().toISOString(),
    })
    .eq("id", validated.id)
    .select("*")
    .single();

  if (error) throw error;
  return mapParticipantCategoryFromRow(data as ParticipantCategoryDbRow);
};

const reassignParticipantsToStandard = async (
  supabase: SupabaseClient,
  slug: string
): Promise<void> => {
  const { error } = await supabase
    .from("participant_details")
    .update({ category: "standard" })
    .eq("category", slug);

  if (error) throw error;
};

export const deleteParticipantCategory = async (
  id: string,
  supabase?: SupabaseClient
): Promise<{ deletedSlug: string | null }> => {
  const client = supabase ?? (await createClient());

  const { data: existing, error: fetchError } = await client
    .from("participant_categories")
    .select("slug, is_protected")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;
  if (existing.is_protected) {
    throw new Error("Protected categories cannot be deleted");
  }

  await reassignParticipantsToStandard(client, existing.slug);

  const { error } = await client
    .from("participant_categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { deletedSlug: existing.slug };
};
