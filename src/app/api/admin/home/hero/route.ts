import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { mapHomeHeroToRow } from "@/lib/home/map-home-hero-row";
import { revalidateHomeVideoCache } from "@/lib/home/revalidate-home-cache";
import { homeHeroSchema } from "@/schemas/homeHeroSchema";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const validated = homeHeroSchema.parse(body);
    const row = mapHomeHeroToRow(validated);

    let savedRow;

    if (validated.id) {
      const { data, error } = await auth.supabase
        .from("home_hero")
        .update(row)
        .eq("id", validated.id)
        .select("id, description, video_url, poster_url")
        .single();

      if (error) throw error;
      savedRow = data;
    } else {
      const { data, error } = await auth.supabase
        .from("home_hero")
        .insert({
          description: validated.description,
          video_url: validated.video_url,
          poster_url: validated.poster_url,
        })
        .select("id, description, video_url, poster_url")
        .single();

      if (error) throw error;
      savedRow = data;
    }

    revalidateHomeVideoCache();

    return NextResponse.json(
      homeHeroSchema.parse({
        id: savedRow.id,
        description: savedRow.description,
        video_url: savedRow.video_url,
        poster_url: savedRow.poster_url,
      })
    );
  } catch (error) {
    console.error("Error in PUT /api/admin/home/hero:", error);
    return NextResponse.json(
      { error: "Failed to update home hero data" },
      { status: 500 }
    );
  }
}
