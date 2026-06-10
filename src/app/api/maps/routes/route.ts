import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import { resolveRouteZoneName } from "@/lib/routes/resolve-route-zone-name";
import { routeSchema } from "@/schemas/mapSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routes")
      .select("id, name, description, route_zone_id, route_zones(name)")
      .order("name");

    if (error) throw error;

    const routes = (data ?? []).map((route) => ({
      id: route.id,
      name: route.name,
      description: route.description,
      route_zone_id: route.route_zone_id,
      zone: resolveRouteZoneName(route.route_zones),
    }));

    return NextResponse.json(routes);
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
    const modCheck = await requirePlatformMod();
    if (!modCheck.ok) {
      return modCheck.response;
    }

    const supabase = await createClient();
    const body = await req.json();
    const { name, description, route_zone_id, dots } = routeSchema.parse(body);

    const { data: zoneRow, error: zoneError } = await supabase
      .from("route_zones")
      .select("id")
      .eq("id", route_zone_id)
      .maybeSingle();

    if (zoneError || !zoneRow) {
      return NextResponse.json({ error: "Invalid route zone" }, { status: 400 });
    }

    const { data: routeData, error: routeError } = await supabase
      .from("routes")
      .insert({
        user_id: modCheck.userId,
        name,
        description,
        route_zone_id,
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

    const hubMap = new Map(hubsData.map((hub) => [hub.hub_host_id, hub.id]));

    const routeDots = dots.map((dot) => {
      const hubId = hubMap.get(dot.user_id);
      return {
        route_id: routeData.id,
        map_info_id: dot.id,
        route_step: dot.route_step,
        user_id: dot.user_id,
        hub_id: hubId || null,
      };
    });

    const { error: dotsError } = await supabase
      .from("route_dots")
      .insert(routeDots);

    if (dotsError) {
      console.error("Error creating route dots:", dotsError);
      await supabase.from("routes").delete().eq("id", routeData.id);
      return NextResponse.json(
        { error: "Failed to create route dots" },
        { status: 500 }
      );
    }

    await revalidateMapDataCacheIfLiveTour(supabase);

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
