import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import { resolveRouteZoneName } from "@/lib/routes/resolve-route-zone-name";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid route ID" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch the route data
    const { data: routeData, error: routeError } = await supabase
      .from("routes")
      .select(
        `
        id,
        name,
        description,
        route_zone_id,
        route_zones(name),
        route_dots (
          id,
          route_step,
          user_id,
          hub_id,
          map_info:map_info_id (
            id,
            formatted_address
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (routeError) {
      console.error("Error fetching route:", routeError);
      return NextResponse.json(
        { error: "Failed to fetch route" },
        { status: 500 }
      );
    }

    if (!routeData) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Fetch hub data
    const { data: hubsData, error: hubsError } = await supabase
      .from("hubs")
      .select("id, name");

    if (hubsError) {
      console.error("Error fetching hubs data:", hubsError);
      return NextResponse.json(
        { error: "Failed to fetch hubs data" },
        { status: 500 }
      );
    }

    const routeDotUserIds = [
      ...new Set(
        routeData.route_dots
          .filter((dot) => !dot.hub_id)
          .map((dot) => dot.user_id)
      ),
    ];

    const { data: participantData, error: participantError } =
      routeDotUserIds.length > 0
        ? await supabase
            .from("participant_details")
            .select("user_id, display_name")
            .in("user_id", routeDotUserIds)
        : { data: [], error: null };

    if (participantError) {
      console.error("Error fetching participant details:", participantError);
      return NextResponse.json(
        { error: "Failed to fetch participant details" },
        { status: 500 }
      );
    }

    const hubMap = new Map(hubsData.map((hub) => [hub.id, hub.name]));
    const displayNameById = new Map(
      (participantData ?? []).map((participant) => [
        participant.user_id,
        getParticipantDisplayName(participant),
      ])
    );

    // Process route_dots to add route_dot_name
    const processedRouteDots = routeData.route_dots.map((dot) => ({
      ...dot,
      route_dot_name: dot.hub_id
        ? hubMap.get(dot.hub_id) || "Unknown Hub"
        : displayNameById.get(dot.user_id) || "Unknown User",
    }));

    // Create the final processed data
    const processedData = {
      ...routeData,
      zone: resolveRouteZoneName(routeData.route_zones),
      route_dots: processedRouteDots,
    };

    const { route_zones: _routeZones, ...responseData } = processedData;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in GET route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid route ID" }, { status: 400 });
    }

    const modCheck = await requirePlatformMod();
    if (!modCheck.ok) {
      return modCheck.response;
    }

    const supabase = await createClient();
    const body = await req.json();
    const { name, description, route_zone_id, route_dots } = body;

    if (!route_zone_id || typeof route_zone_id !== "string") {
      return NextResponse.json({ error: "Invalid route zone" }, { status: 400 });
    }

    const zoneParse = z.string().uuid().safeParse(route_zone_id);
    if (!zoneParse.success) {
      return NextResponse.json({ error: "Invalid route zone" }, { status: 400 });
    }

    const { data: zoneRow, error: zoneError } = await supabase
      .from("route_zones")
      .select("id")
      .eq("id", route_zone_id)
      .maybeSingle();

    if (zoneError || !zoneRow) {
      return NextResponse.json({ error: "Invalid route zone" }, { status: 400 });
    }

    console.log("Received data:", { route_dots, route_zone_id, name, description });

    // Check if route_dots is undefined or not an array
    if (!route_dots || !Array.isArray(route_dots)) {
      return NextResponse.json(
        { error: "Invalid route_dots data" },
        { status: 400 }
      );
    }

    // Update the route
    const { data: routeData, error: routeError } = await supabase
      .from("routes")
      .update({
        name,
        description,
        route_zone_id,
      })
      .eq("id", id)
      .select()
      .single();

    if (routeError) {
      console.error("Error updating route:", routeError);
      return NextResponse.json(
        { error: "Failed to update route" },
        { status: 500 }
      );
    }

    // Delete existing route dots
    const { error: deleteError } = await supabase
      .from("route_dots")
      .delete()
      .eq("route_id", id);

    if (deleteError) {
      console.error("Error deleting existing route dots:", deleteError);
      return NextResponse.json(
        { error: "Failed to update route dots" },
        { status: 500 }
      );
    }

    // Prepare the route dots
    const newRouteDots = route_dots.map((dot: DatabaseintroRoute) => ({
      route_id: id,
      map_info_id: dot.map_info_id,
      user_id: dot.user_id,
      hub_id: dot.hub_id,
      route_step: dot.route_step,
    }));

    console.log("Prepared route dots:", newRouteDots);

    // Insert the new route dots
    const { error: dotsError } = await supabase
      .from("route_dots")
      .insert(newRouteDots);

    if (dotsError) {
      console.error("Error updating route dots:", dotsError);
      return NextResponse.json(
        { error: "Failed to update route dots" },
        { status: 500 }
      );
    }

    await revalidateMapDataCacheIfLiveTour(supabase);

    return NextResponse.json({ success: true, route: routeData });
  } catch (error) {
    console.error("Error in route update:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

interface DatabaseintroRoute {
  route_id: string;
  map_info_id: string;
  user_id: string;
  hub_id: string | null;
  route_step: number;
}

export interface RouteDot {
  id?: string; // Optional as it might be auto-generated
  route_id: string;
  map_info_id: string; // This should match the database column name
  user_id: string;
  hub_id: string | null;
  route_step: number;
  map_info?: {
    id: string;
    formatted_address: string;
  };
  route_dot_name?: string; // This isn't in the database schema, but might be useful for UI
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid route ID" }, { status: 400 });
    }

    const modCheck = await requirePlatformMod();
    if (!modCheck.ok) {
      return modCheck.response;
    }

    const supabase = await createClient();

    // Delete the route
    const { error: deleteError } = await supabase
      .from("routes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting route:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete route" },
        { status: 500 }
      );
    }

    await revalidateMapDataCacheIfLiveTour(supabase);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in route deletion:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
