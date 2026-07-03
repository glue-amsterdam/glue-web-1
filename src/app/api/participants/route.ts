
import { getExhibitorsPage } from "@/lib/participants/get-exhibitors-page";
import {
  ExhibitorsQueryError,
  parseExhibitorsQuery,
} from "@/lib/participants/exhibitors-query";
import {
  fetchParticipantCategories,
  getValidFilterSlugs,
} from "@/lib/participants/participant-categories";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createPublicSupabaseClient();
    const categories = await fetchParticipantCategories(supabase);
    const validSlugs = getValidFilterSlugs(categories);

    let query;
    try {
      query = parseExhibitorsQuery(searchParams, validSlugs);
    } catch (error) {
      if (error instanceof ExhibitorsQueryError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    const response = await getExhibitorsPage(supabase, query);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching exhibitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch exhibitors" },
      { status: 500 }
    );
  }
}
