import { routeSchema } from "@/schemas/mapSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        id,
        name,
        description,
        zone,
        user_info:user_id (
          user_name
        )
      `
      )
      .order("name");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching routes:", error);
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
    const { name, description, zone, dots } = routeSchema.parse(body);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert the route
    const { data: routeData, error: routeError } = await supabase
      .from("routes")
      .insert({
        user_id: user.id,
        name,
        description,
        zone,
      })
      .select()
      .single();

    if (routeError) {
      console.error("Error creating route:", routeError);
      return NextResponse.json(
        { error: "Failed to create route" },
        { status: 500 }
      );
    }

    // Fetch hub data to determine if a user is a hub host
    const { data: hubsData, error: hubsError } = await supabase
      .from("hubs")
      .select("hub_host_id, id");

    if (hubsError) {
      console.error("Error fetching hubs data:", hubsError);
      return NextResponse.json(
        { error: "Failed to fetch hubs data" },
        { status: 500 }
      );
    }

    // Create a map for quick lookup
    const hubMap = new Map(hubsData.map((hub) => [hub.hub_host_id, hub.id]));

    // Prepare the route dots
    const routeDots = dots.map((dot) => {
      const hubId = hubMap.get(dot.user_id);
      return {
        route_id: routeData.id,
        map_info_id: dot.id,
        route_step: dot.route_step,
        user_id: dot.user_id,
        hub_id: hubId || null, // Use hub_id if the user is a hub host, otherwise null
      };
    });

    // Insert the route dots
    const { error: dotsError } = await supabase
      .from("route_dots")
      .insert(routeDots);

    if (dotsError) {
      console.error("Error creating route dots:", dotsError);
      // If dots insertion fails, we should delete the route we just created
      await supabase.from("routes").delete().eq("id", routeData.id);
      return NextResponse.json(
        { error: "Failed to create route dots" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, route: routeData });
  } catch (error) {
    console.error("Error in route creation:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
