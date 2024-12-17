import { NextResponse } from "next/server";
import { hubSchema } from "@/schemas/hubSchemas";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ hubId: string }> }
) {
  try {
    const supabase = await createClient();
    const { hubId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the hub data
    const { data: hubData, error: hubError } = await supabase
      .from("hubs")
      .select(
        `
        *,
        hub_participants (
          user_id
        ),
        user_info!hubs_hub_host_id_fkey (
          user_id,
          user_name,
          visible_emails
        )
      `
      )
      .eq("id", hubId)
      .single();

    if (hubError) {
      console.error("Error fetching hub:", hubError);
      return NextResponse.json(
        { error: "Failed to fetch hub" },
        { status: 500 }
      );
    }

    if (!hubData) {
      return NextResponse.json({ error: "Hub not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, hub: hubData });
  } catch (error) {
    console.error("Error in hub fetch:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ hubId: string }> }
) {
  try {
    const supabase = await createClient();
    const { hubId } = await params;
    const body = await req.json();
    const { name, description, participants, hub_host } = hubSchema.parse(body);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the hub
    const { data: hubData, error: hubError } = await supabase
      .from("hubs")
      .update({
        name,
        description,
        hub_host_id: typeof hub_host === "string" ? hub_host : hub_host.user_id,
      })
      .eq("id", hubId)
      .select()
      .single();

    if (hubError) {
      console.error("Error updating hub:", hubError);
      return NextResponse.json(
        { error: "Failed to update hub" },
        { status: 500 }
      );
    }

    // Delete existing participants
    const { error: deleteError } = await supabase
      .from("hub_participants")
      .delete()
      .eq("hub_id", hubId);

    if (deleteError) {
      console.error("Error deleting existing participants:", deleteError);
      return NextResponse.json(
        { error: "Failed to update hub participants" },
        { status: 500 }
      );
    }

    // Prepare the new hub participants
    const hubParticipants = participants.map((participant) => ({
      hub_id: hubId,
      user_id:
        typeof participant === "string" ? participant : participant.user_id,
    }));

    // Insert the new hub participants
    const { error: participantsError } = await supabase
      .from("hub_participants")
      .insert(hubParticipants);

    if (participantsError) {
      console.error("Error updating hub participants:", participantsError);
      return NextResponse.json(
        { error: "Failed to update hub participants" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, hub: hubData });
  } catch (error) {
    console.error("Error in hub update:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
