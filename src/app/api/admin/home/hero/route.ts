import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { fetchHomeHero } from "@/lib/home/fetch-home-hero";
import { mapHomeHeroToRow } from "@/lib/home/map-home-hero-row";
import { revalidateHomeVideoCache } from "@/lib/home/revalidate-home-cache";
import { homeHeroSchema } from "@/schemas/homeHeroSchema";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createPublicSupabaseClient();
    const hero = await fetchHomeHero(supabase);

    return NextResponse.json(
      homeHeroSchema.parse({
        id: hero.id ?? undefined,
        description: hero.description,
        video_url: hero.videoUrl,
        poster_url: hero.posterUrl,
      })
    );
  } catch (error) {
    console.error("Error in GET /api/admin/home/hero:", error);
    return NextResponse.json(
      { error: "Failed to fetch home hero data" },
      { status: 500 }
    );
  }
}

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
