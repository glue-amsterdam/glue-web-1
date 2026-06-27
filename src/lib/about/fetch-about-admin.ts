import { HOME_EXHIBITORS_HEADER_CACHE_TAG } from "@/lib/participants/fetch-home-exhibitors-header";
import { revalidateHomeStickyCache, revalidateHomeCitizensCache } from "@/lib/home";
import { revalidateSponsorsCache } from "@/lib/about/revalidate-sponsors-cache";
import { participantsSectionSchema } from "@/schemas/participantsAdminSchema";
import { curatedMembersSectionSchema } from "@/schemas/curatedSchema";
import {
  sponsorSchema,
  sponsorsHeaderSchema,
  type Sponsor,
  type SponsorsHeader,
} from "@/schemas/sponsorsSchema";
import { createClient } from "@/utils/supabase/server";
import { config } from "@/config";
import { toMediaKey, toMediaUrl } from "@/lib/media/media-url";
import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CitizensSectionHeader } from "@/schemas/citizenSchema";

export const fetchAboutParticipantsSection = async (
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("about_participants")
    .select("title,description,is_visible")
    .single();

  if (error || !data) {
    throw new Error("Failed to fetch participants about data");
  }

  return data;
};

export const upsertAboutParticipantsSection = async (
  input: { title: string; description: string; is_visible: boolean },
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const validatedData = participantsSectionSchema.parse(input);

  const { data, error } = await client
    .from("about_participants")
    .upsert({
      id: "about-participants",
      title: validatedData.title,
      description: validatedData.description,
      is_visible: validatedData.is_visible,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidateTag(HOME_EXHIBITORS_HEADER_CACHE_TAG, "max");
  revalidateTag("participants", "max");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/exhibitors");

  return data;
};

export const fetchAboutCuratedSection = async (supabase?: SupabaseClient) => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("about_curated")
    .select("title, description, is_visible")
    .single();

  if (error || !data) {
    throw new Error("Failed to fetch curated about data");
  }

  return data;
};

export const upsertAboutCuratedSection = async (
  input: { title: string; description: string; is_visible: boolean },
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const validatedData = curatedMembersSectionSchema.parse(input);

  const { data, error } = await client
    .from("about_curated")
    .upsert({
      id: "about-curated",
      title: validatedData.title,
      description: validatedData.description,
      is_visible: validatedData.is_visible,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidateHomeStickyCache();

  return data;
};

export const fetchAboutCitizensHeader = async (
  supabase?: SupabaseClient
): Promise<CitizensSectionHeader> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("about_citizens_section")
    .select("title, description, is_visible")
    .eq("id", "about-citizens-section")
    .single();

  if (error || !data) {
    throw new Error("Failed to fetch citizens section header");
  }

  return {
    title: data.title,
    description: data.description,
    is_visible: data.is_visible,
  };
};

export const updateAboutCitizensSection = async (
  input: { title: string; description: string; is_visible: boolean },
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("about_citizens_section")
    .update({
      title: input.title,
      description: input.description,
      is_visible: input.is_visible,
    })
    .eq("id", "about-citizens-section")
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidateHomeCitizensCache();

  return data;
};

export const fetchAboutSponsors = async (
  supabase?: SupabaseClient
): Promise<Sponsor[]> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client.from("about_sponsors").select("*");

  if (error) {
    throw error;
  }

  return (data ?? []).map((sponsor) => ({
    ...sponsor,
    image_url: toMediaUrl(sponsor.image_url) ?? "",
  }));
};

export const fetchAboutSponsorsHeader = async (
  supabase?: SupabaseClient
): Promise<SponsorsHeader> => {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("about_sponsors_header")
    .select("*")
    .eq("id", "about-sponsors-header-section")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateAboutSponsorsHeader = async (
  input: SponsorsHeader,
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const validatedData = sponsorsHeaderSchema.parse(input);

  const { data, error } = await client
    .from("about_sponsors_header")
    .update({
      title: validatedData.title,
      description: validatedData.description,
      sponsors_types: validatedData.sponsors_types,
      is_visible: validatedData.is_visible,
    })
    .eq("id", "about-sponsors-header-section")
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidateSponsorsCache();

  return data;
};

export const createAboutSponsor = async (
  input: Omit<Sponsor, "id"> & { id?: string },
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const validatedData = sponsorSchema.parse(input);

  const { data, error } = await client
    .from("about_sponsors")
    .insert({
      name: validatedData.name,
      website: validatedData.website,
      sponsor_type: validatedData.sponsor_type,
      image_url: toMediaKey(validatedData.image_url),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidateSponsorsCache();

  return data ? { ...data, image_url: toMediaUrl(data.image_url) } : data;
};

export const updateAboutSponsor = async (
  input: Sponsor,
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const validatedData = sponsorSchema.parse(input);

  const { data: currentSponsor, error: fetchError } = await client
    .from("about_sponsors")
    .select("image_url")
    .eq("id", validatedData.id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const currentKey = toMediaKey(currentSponsor?.image_url);
  const nextKey = toMediaKey(validatedData.image_url);
  if (currentKey && currentKey !== nextKey) {
    await client.storage.from(config.bucketName).remove([currentKey]);
  }

  const { data, error } = await client
    .from("about_sponsors")
    .update({
      name: validatedData.name,
      website: validatedData.website,
      sponsor_type: validatedData.sponsor_type,
      image_url: nextKey,
    })
    .eq("id", validatedData.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidateSponsorsCache();

  return data ? { ...data, image_url: toMediaUrl(data.image_url) } : data;
};

export const deleteAboutSponsor = async (
  id: string,
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());

  const { data: sponsorData, error: fetchError } = await client
    .from("about_sponsors")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const sponsorKey = toMediaKey(sponsorData?.image_url);
  if (sponsorKey) {
    try {
      await client.storage.from(config.bucketName).remove([sponsorKey]);
    } catch {
      // Continue with sponsor deletion even if image deletion fails
    }
  }

  const { error: deleteError } = await client
    .from("about_sponsors")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw deleteError;
  }

  revalidateSponsorsCache();
};

export const fetchAboutCarouselAdmin = async (supabase?: SupabaseClient) => {
  const client = supabase ?? (await createClient());

  const { data: carouselData, error: carouselError } = await client
    .from("about_carousel")
    .select("*")
    .single();

  if (carouselError) {
    throw carouselError;
  }

  const { data: slides, error: slidesError } = await client
    .from("about_carousel_slides")
    .select("*")
    .order("created_at");

  if (slidesError) {
    throw slidesError;
  }

  return {
    title: carouselData.title,
    description: carouselData.description,
    is_visible: carouselData.is_visible,
    text_color: carouselData.text_color,
    slides: (slides ?? []).map((slide) => ({
      id: slide.id,
      image_url: toMediaUrl(slide.image_url) ?? "",
      image_name: slide.image_name,
    })),
  };
};
