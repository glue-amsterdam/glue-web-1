import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_HOME_STICKY_BUTTON_LABEL,
  DEFAULT_HOME_STICKY_BUTTON_LINK,
} from "@/schemas/homeStickyCtaSchema";
import type { HomeStickyCtaData } from "./types";

export const EMPTY_HOME_STICKY_CTA: HomeStickyCtaData = {
  id: null,
  buttonLabel: DEFAULT_HOME_STICKY_BUTTON_LABEL,
  buttonLink: DEFAULT_HOME_STICKY_BUTTON_LINK,
};

export const fetchHomeStickyCta = async (
  supabase: SupabaseClient
): Promise<HomeStickyCtaData> => {
  const { data, error } = await supabase
    .from("home_sticky_cta")
    .select("id, button_label, button_link")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return EMPTY_HOME_STICKY_CTA;
  }

  return {
    id: data.id ?? null,
    buttonLabel:
      data.button_label?.trim() || DEFAULT_HOME_STICKY_BUTTON_LABEL,
    buttonLink: data.button_link?.trim() || DEFAULT_HOME_STICKY_BUTTON_LINK,
  };
};
