import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Buscar los hub_id en la tabla hub_participants
    const { data: hubParticipants, error: hubParticipantsError } =
      await supabase
        .from("hub_participants")
        .select("hub_id")
        .eq("user_id", userId);

    if (hubParticipantsError) throw hubParticipantsError;

    const hubIds = hubParticipants.map((hp) => hp.hub_id);

    // Buscar la información de los hubs
    const { data: hubs, error: hubsError } = await supabase
      .from("hubs")
      .select("id, name, hub_host_id")
      .in("id", hubIds);

    if (hubsError) throw hubsError;

    // Buscar la información de map_info para cada hub
    const hubsWithMapInfo = await Promise.all(
      hubs.map(async (hub) => {
        const { data: mapInfo, error: mapInfoError } = await supabase
          .from("map_info")
          .select("id, formatted_address")
          .eq("user_id", hub.hub_host_id)
          .single();

        if (mapInfoError) throw mapInfoError;

        return {
          ...hub,
          mapInfoId: mapInfo?.id,
          hub_address: mapInfo?.formatted_address,
        };
      })
    );

    return NextResponse.json(hubsWithMapInfo);
  } catch (error) {
    console.error("Error fetching participant hubs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
