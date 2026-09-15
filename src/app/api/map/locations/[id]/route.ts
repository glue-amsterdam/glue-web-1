import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import {
  EXHIBITOR_DETAIL_CACHE_TAG,
  EXHIBITOR_HUB_DETAIL_CACHE_TAG,
  fetchExhibitorDetailByHubId,
  fetchExhibitorDetailBySlug,
} from "@/lib/participants/fetch-exhibitor-detail";
import { getExhibitorLink } from "@/lib/participants/exhibitors-filters";
import { MAP_DATA_CACHE_TAG, type MapLocationDetail } from "@/lib/map/types";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const buildDetailFromSlug = async (
  slug: string,
): Promise<MapLocationDetail> => {
  const exhibitor = await fetchExhibitorDetailBySlug(slug);
  return {
    imageUrl: exhibitor.carouselSlides[0]?.imageUrl ?? null,
    description: exhibitor.description ?? null,
    memberCount: 1,
    profileHref: getExhibitorLink({ slug }),
  };
};

const buildDetailFromHub = async (
  hubId: string,
): Promise<MapLocationDetail> => {
  const hub = await fetchExhibitorDetailByHubId(hubId);
  return {
    imageUrl: hub.members[0]?.imageUrl ?? null,
    description: hub.description,
    memberCount: hub.members.length,
    members: hub.members.map((member) => ({
      name: member.name,
      slug: member.slug,
      imageUrl: member.imageUrl,
      userId: member.userId,
    })),
    profileHref: getExhibitorLink({ hubId }),
  };
};

const getCachedMapLocationDetail = unstable_cache(
  async (mapInfoId: string): Promise<MapLocationDetail> => {
    const supabase = createPublicSupabaseClient();
    const { data: mapInfo, error: mapInfoError } = await supabase
      .from("map_info")
      .select("id, user_id")
      .eq("id", mapInfoId)
      .maybeSingle();

    if (mapInfoError) throw mapInfoError;
    if (!mapInfo) {
      throw new ExhibitorNotFoundError("Location not found");
    }

    const { data: hub, error: hubError } = await supabase
      .from("hubs")
      .select("id")
      .eq("hub_host_id", mapInfo.user_id)
      .maybeSingle();

    if (hubError) throw hubError;
    if (hub?.id) {
      return buildDetailFromHub(hub.id);
    }

    const { data: participant, error: participantError } = await supabase
      .from("participant_details")
      .select("slug")
      .eq("user_id", mapInfo.user_id)
      .maybeSingle();

    if (participantError) throw participantError;
    if (!participant?.slug) {
      throw new ExhibitorNotFoundError("Location not found");
    }

    return buildDetailFromSlug(participant.slug);
  },
  ["map-location-detail"],
  {
    tags: [
      MAP_DATA_CACHE_TAG,
      EXHIBITOR_DETAIL_CACHE_TAG,
      EXHIBITOR_HUB_DETAIL_CACHE_TAG,
    ],
    revalidate: 600,
  },
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: mapInfoId } = await params;
    const detail = await getCachedMapLocationDetail(mapInfoId);

    return NextResponse.json(detail, {
      status: 200,
      headers: {
        "Cache-Control":
          "public, max-age=60, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    if (error instanceof ExhibitorNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error fetching map location detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch location detail" },
      { status: 500 },
    );
  }
}
