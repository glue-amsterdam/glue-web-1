import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

interface Route {
  id: string;
  name: string;
  description: string | null;
  zone: string;
  user_id: string;
}

interface MapInfo {
  id: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
}

interface RouteDot {
  id: string;
  route_id: string;
  map_info_id: string;
  route_step: number;
  map_info: MapInfo;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch routes
    const { data: routesData, error: routesError } = await supabase.from(
      "routes"
    ).select(`
        id,
        name,
        description,
        zone,
        user_id
      `);

    if (routesError) throw routesError;

    // Fetch route dots with map_info
    const { data: routeDotsData, error: routeDotsError } = await supabase
      .from("route_dots")
      .select(
        `
        id,
        route_id,
        map_info_id,
        route_step,
        map_info (
          id,
          latitude,
          longitude,
          formatted_address
        )
      `
      )
      .order("route_step");

    if (routeDotsError) throw routeDotsError;

    // Transform the data
    const transformedRoutes = routesData.map((route: Route) => ({
      ...route,
      dots: (routeDotsData as unknown as RouteDot[])
        .filter((dot: RouteDot) => dot.route_id === route.id)
        .map((dot: RouteDot) => ({
          id: dot.id,
          route_step: dot.route_step,
          latitude: dot.map_info.latitude,
          longitude: dot.map_info.longitude,
          formatted_address: dot.map_info.formatted_address,
        }))
        .sort((a, b) => a.route_step - b.route_step),
    }));

    return NextResponse.json(transformedRoutes);
  } catch (error) {
    console.error("Error fetching routes and route dots:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
