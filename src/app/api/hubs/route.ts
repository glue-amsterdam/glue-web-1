import { NextResponse } from "next/server";
import { hubSchema } from "@/schemas/hubSchemas";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: hubs, error } = await supabase.from("hubs").select(`
        *,
        hub_participants(user_id),
        user_info!hubs_hub_host_id_fkey(user_id)
      `);

    if (error) throw error;

    return NextResponse.json(hubs);
  } catch (error) {
    console.error("Error fetching hubs:", error);
    return NextResponse.json({ error: "Error fetching hubs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const body = await req.json();
    const { name, description, participants, hub_host } = hubSchema.parse(body);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert the hub
    const { data: hubData, error: hubError } = await supabase
      .from("hubs")
      .insert({
        name,
        description,
        hub_host_id: typeof hub_host === "string" ? hub_host : hub_host.user_id,
      })
      .select()
      .single();

    if (hubError) {
      console.error("Error creating hub:", hubError);
      return NextResponse.json(
        { error: "Failed to create hub" },
        { status: 500 }
      );
    }

    // Prepare the hub participants
    const hubParticipants = participants.map((participant) => ({
      hub_id: hubData.id,
      user_id:
        typeof participant === "string" ? participant : participant.user_id,
    }));

    // Insert the hub participants
    const { error: participantsError } = await supabase
      .from("hub_participants")
      .insert(hubParticipants);

    if (participantsError) {
      console.error("Error creating hub participants:", participantsError);
      // If participants insertion fails, we should delete the hub we just created
      await supabase.from("hubs").delete().eq("id", hubData.id);
      return NextResponse.json(
        { error: "Failed to create hub participants" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, hub: hubData });
  } catch (error) {
    console.error("Error in hub creation:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
