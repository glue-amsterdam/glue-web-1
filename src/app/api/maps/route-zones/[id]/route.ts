import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateRouteZoneSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const modCheck = await requirePlatformMod();
  if (!modCheck.ok) {
    return modCheck.response;
  }

  const { id } = await context.params;
  const idParse = z.string().uuid().safeParse(id);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid route zone id" }, { status: 400 });
  }

  try {
    const json = await request.json();
    const parsed = updateRouteZoneSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("route_zones")
      .update({ name: parsed.data.name })
      .eq("id", idParse.data)
      .select("id, name, created_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Route zone not found" }, { status: 404 });
      }
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A route zone with this name already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    await revalidateMapDataCacheIfLiveTour(supabase);

    return NextResponse.json({ zone: data });
  } catch (err) {
    console.error("PATCH /api/maps/route-zones/[id]:", err);
    return NextResponse.json(
      { error: "Failed to update route zone" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const modCheck = await requirePlatformMod();
  if (!modCheck.ok) {
    return modCheck.response;
  }

  const { id } = await context.params;
  const idParse = z.string().uuid().safeParse(id);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid route zone id" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { count, error: countError } = await supabase
      .from("routes")
      .select("id", { count: "exact", head: true })
      .eq("route_zone_id", idParse.data);

    if (countError) {
      throw countError;
    }

    const { data, error } = await supabase
      .from("route_zones")
      .delete()
      .eq("id", idParse.data)
      .select("id");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Route zone not found" }, { status: 404 });
    }

    await revalidateMapDataCacheIfLiveTour(supabase);

    return NextResponse.json({
      success: true,
      unassignedRouteCount: count ?? 0,
    });
  } catch (err) {
    console.error("DELETE /api/maps/route-zones/[id]:", err);
    return NextResponse.json(
      { error: "Failed to delete route zone" },
      { status: 500 }
    );
  }
}
