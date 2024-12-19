import { routeApiCallSchema } from "@/schemas/mapSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    const { data: route, error: routeError } = await supabase
      .from("routes")
      .select(
        `
        *,
        route_dots (
          id,
          route_step,
          map_info (
            id,
            formatted_address,
            latitude,
            longitude,
            no_address
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (routeError) throw routeError;

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    return NextResponse.json(route);
  } catch (error) {
    console.error("Error fetching route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate the incoming data
    const validatedData = routeApiCallSchema.parse(body);

    // Update the route
    const { error: routeUpdateError } = await supabase
      .from("routes")
      .update({
        name: validatedData.name,
        description: validatedData.description,
        zone: validatedData.zone,
      })
      .eq("id", id);

    if (routeUpdateError) throw routeUpdateError;

    // Delete existing route_dots
    const { error: deleteDotsError } = await supabase
      .from("route_dots")
      .delete()
      .eq("route_id", id);

    if (deleteDotsError) throw deleteDotsError;

    // Insert new route_dots
    const newRouteDots = validatedData.route_dots.map((dot) => ({
      route_id: id,
      map_info_id: dot.map_info.id,
      route_step: dot.route_step,
    }));

    const { error: insertDotsError } = await supabase
      .from("route_dots")
      .insert(newRouteDots);

    if (insertDotsError) throw insertDotsError;

    // Fetch the updated route to return in the response
    const { data: updatedRoute, error: fetchError } = await supabase
      .from("routes")
      .select(
        `
          *,
          route_dots (
            id,
            route_step,
            map_info (
              id,
              formatted_address,
              latitude,
              longitude
            )
          )
        `
      )
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(updatedRoute);
  } catch (error) {
    console.error("Error updating route:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
