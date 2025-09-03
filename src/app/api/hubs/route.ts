import { NextResponse } from "next/server";
import { hubSchema } from "@/schemas/hubSchemas";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: hubs, error } = await supabase
      .from("hubs")
      .select(
        `
        id,
        name,
        description,
        hub_host_id,
        display_number,
        participants: hub_participants (user_id)
      `
      )
      .order("name");

    if (error) {
      console.error("Error fetching hubs:", error);
      return NextResponse.json(
        { error: "Failed to fetch hubs" },
        { status: 500 }
      );
    }

    // Fetch user info for hub hosts
    const hostIds = hubs.map((hub) => hub.hub_host_id);
    const { data: hostUsers, error: hostError } = await supabase
      .from("user_info")
      .select("user_id, user_name, visible_emails")
      .in("user_id", hostIds);

    if (hostError) {
      console.error("Error fetching host users:", hostError);
      return NextResponse.json(
        { error: "Failed to fetch host users" },
        { status: 500 }
      );
    }

    const hostUserMap = new Map(hostUsers.map((user) => [user.user_id, user]));

    const transformedHubs = hubs.map((hub) => ({
      id: hub.id,
      name: hub.name,
      description: hub.description,
      display_number: hub.display_number,
      hub_host: hostUserMap.get(hub.hub_host_id) || {
        user_id: hub.hub_host_id,
        user_name: null,
        visible_emails: [],
      },
      participants: hub.participants,
    }));

    return NextResponse.json(transformedHubs);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const body = await req.json();
    const { name, description, participants, hub_host, display_number } =
      hubSchema.parse(body);

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
        display_number,
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

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hubData = await request.json();

    if (!hubData.id) {
      return NextResponse.json(
        { error: "Hub ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("hubs")
      .update({
        name: hubData.name,
        description: hubData.description,
        hub_host_id: hubData.hub_host.user_id,
        display_number: hubData.display_number,
      })
      .eq("id", hubData.id)
      .select();

    if (error) {
      console.error("Error updating hub:", error);
      return NextResponse.json(
        { error: "Failed to update hub" },
        { status: 500 }
      );
    }

    // Update participants
    await supabase.from("hub_participants").delete().eq("hub_id", hubData.id);

    for (const participant of hubData.participants) {
      await supabase
        .from("hub_participants")
        .insert({ hub_id: hubData.id, user_id: participant.user_id });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const hubId = searchParams.get("id");

    if (!hubId) {
      return NextResponse.json(
        { error: "Hub ID is required" },
        { status: 400 }
      );
    }

    // Delete participants first due to foreign key constraint
    const { error: participantsError } = await supabase
      .from("hub_participants")
      .delete()
      .eq("hub_id", hubId);

    if (participantsError) {
      console.error("Error deleting hub participants:", participantsError);
      return NextResponse.json(
        { error: "Failed to delete hub participants" },
        { status: 500 }
      );
    }

    // Now delete the hub
    const { error: hubError } = await supabase
      .from("hubs")
      .delete()
      .eq("id", hubId);

    if (hubError) {
      console.error("Error deleting hub:", hubError);
      return NextResponse.json(
        { error: "Failed to delete hub" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Hub deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
