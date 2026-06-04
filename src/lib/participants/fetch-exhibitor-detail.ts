import { createClient } from "@/utils/supabase/server";
import type {
  ExhibitorHubDetail,
  ExhibitorParticipantDetail,
} from "./exhibitor-detail-types";
import { getExhibitorBySlug } from "./get-exhibitor-by-slug";
import { getExhibitorHubById } from "./get-exhibitor-hub-by-id";

export const fetchExhibitorDetailBySlug = async (
  slug: string
): Promise<ExhibitorParticipantDetail> => {
  const supabase = await createClient();
  return getExhibitorBySlug(supabase, slug);
};

export const fetchExhibitorDetailByHubId = async (
  hubId: string
): Promise<ExhibitorHubDetail> => {
  const supabase = await createClient();
  return getExhibitorHubById(supabase, hubId);
};
