
import { getExhibitorsPage } from "@/lib/participants/get-exhibitors-page";
import {
  ExhibitorsQueryError,
  parseExhibitorsQuery,
} from "@/lib/participants/exhibitors-query";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    let query;
    try {
      query = parseExhibitorsQuery(searchParams);
    } catch (error) {
      if (error instanceof ExhibitorsQueryError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    const supabase = createPublicSupabaseClient();
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
