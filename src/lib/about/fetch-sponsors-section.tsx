import { unstable_cache } from "next/cache";

import { SPONSORS_CACHE_TAG } from "@/lib/about/sponsors-cache-tags";
import {
  SponsorsSection,
  sponsorsSectionSchema,
} from "@/schemas/sponsorsSchema";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { toMediaUrl } from "@/lib/media/media-url";
import { ensureSponsorTypeIds } from "@/lib/about/sponsor-type-utils";

const SPONSORS_FALLBACK_DATA: SponsorsSection = {
  sponsorsHeaderSchema: {
    id: "sponsors-section",
    title: "Sponsors",
    is_visible: false,
    description:
      "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
    sponsors_types: [
      { id: "gold", label: "Gold" },
      { id: "silver", label: "Silver" },
      { id: "bronze", label: "Bronze" },
    ],
  },
  sponsors: [
    {
      id: "placeholder-1",
      name: "Placeholder 1",
      website: "https://www.placeholder.com",
      sponsor_type: "gold",
      image_url: "/placeholder.jgp",
    },
    {
      id: "placeholder-2",
      name: "Placeholder 2",
      website: "https://www.placeholder.com",
      sponsor_type: "silver",
      image_url: "/placeholder.jgp",
    },
    {
      id: "placeholder-3",
      name: "Placeholder 3",
      website: "https://www.placeholder.com",
      sponsor_type: "bronze",
      image_url: "/placeholder.jgp",
    },
  ],
};

const SPONSORS_HIDDEN_DATA: SponsorsSection = {
  sponsorsHeaderSchema: {
    id: "sponsors-section",
    title: "Sponsor data is not yet available. ",
    is_visible: false,
    description: "Sponsor data is not yet available.",
    sponsors_types: [],
  },
  sponsors: [],
};

const fetchSponsorsDataCached = unstable_cache(
  async (): Promise<SponsorsSection> => {
    const supabase = createPublicSupabaseClient();
    const { data: headerData, error: headerError } = await supabase
      .from("about_sponsors_header")
      .select("*")
      .eq("id", "about-sponsors-header-section")
      .single();

    if (headerError) {
      throw headerError;
    }

    if (!headerData.is_visible) {
      return sponsorsSectionSchema.parse(SPONSORS_HIDDEN_DATA);
    }

    const { data: sponsorsData, error: sponsorsError } = await supabase
      .from("about_sponsors")
      .select("*");

    if (sponsorsError) {
      throw sponsorsError;
    }

    return sponsorsSectionSchema.parse({
      sponsorsHeaderSchema: {
        ...headerData,
        sponsors_types: ensureSponsorTypeIds(headerData.sponsors_types ?? []),
      },
      sponsors: (sponsorsData ?? []).map((sponsor) => ({
        ...sponsor,
        image_url: toMediaUrl(sponsor.image_url),
      })),
    });
  },
  [SPONSORS_CACHE_TAG],
  { tags: [SPONSORS_CACHE_TAG], revalidate: 3600 }
);

export async function fetchSponsorsData(): Promise<SponsorsSection> {
  try {
    return await fetchSponsorsDataCached();
  } catch (error) {
    console.error("Error fetching sponsors data:", error);
    return getMockData();
  }
}

export function getMockData(): SponsorsSection {
  return SPONSORS_FALLBACK_DATA;
}
