import { revalidateMapDataCacheIfLiveTour } from "@/lib/map/revalidate-map-cache";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const routeZoneSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("route_zones")
      .select("id, name, created_at")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ zones: data ?? [] });
  } catch (err) {
    console.error("GET /api/maps/route-zones:", err);
    return NextResponse.json(
      { error: "Failed to fetch route zones" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const modCheck = await requirePlatformMod();
  if (!modCheck.ok) {
    return modCheck.response;
  }

  try {
    const json = await request.json();
    const parsed = routeZoneSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("route_zones")
      .insert({ name: parsed.data.name })
      .select("id, name, created_at")
      .single();

    if (error) {
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
    console.error("POST /api/maps/route-zones:", err);
    return NextResponse.json(
      { error: "Failed to create route zone" },
      { status: 500 }
    );
  }
}
