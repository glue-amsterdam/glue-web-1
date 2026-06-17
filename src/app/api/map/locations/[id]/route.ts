import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import { getExhibitorBySlug } from "@/lib/participants/get-exhibitor-by-slug";
import { getExhibitorHubById } from "@/lib/participants/get-exhibitor-hub-by-id";
import { getExhibitorLink } from "@/lib/participants/exhibitors-filters";
import type { MapLocationDetail } from "@/lib/map/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const buildDetailFromSlug = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string
): Promise<MapLocationDetail> => {
  const exhibitor = await getExhibitorBySlug(supabase, slug);
  return {
    imageUrl: exhibitor.carouselSlides[0]?.imageUrl ?? null,
    description: exhibitor.description ?? null,
    memberCount: 1,
    profileHref: getExhibitorLink({ slug }),
  };
};

const buildDetailFromHub = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  hubId: string
): Promise<MapLocationDetail> => {
  const hub = await getExhibitorHubById(supabase, hubId);
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mapInfoId } = await params;
    const supabase = await createClient();

    const { data: mapInfo, error: mapInfoError } = await supabase
      .from("map_info")
      .select("id, user_id")
      .eq("id", mapInfoId)
      .maybeSingle();

    if (mapInfoError) throw mapInfoError;
    if (!mapInfo) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const { data: hub, error: hubError } = await supabase
      .from("hubs")
      .select("id")
      .eq("hub_host_id", mapInfo.user_id)
      .maybeSingle();

    if (hubError) throw hubError;

    if (hub?.id) {
      const detail = await buildDetailFromHub(supabase, hub.id);
      return NextResponse.json(detail, {
        status: 200,
        headers: { "Cache-Control": "private, max-age=60" },
      });
    }

    const { data: participant, error: participantError } = await supabase
      .from("participant_details")
      .select("slug")
      .eq("user_id", mapInfo.user_id)
      .maybeSingle();

    if (participantError) throw participantError;
    if (!participant?.slug) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const detail = await buildDetailFromSlug(supabase, participant.slug);

    return NextResponse.json(detail, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    if (error instanceof ExhibitorNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error fetching map location detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch location detail" },
      { status: 500 }
    );
  }
}
