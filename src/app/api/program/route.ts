import { getProgramPage } from "@/lib/program/get-program-page";
import { parseProgramQuery, ProgramQueryError } from "@/lib/program/program-query";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseProgramQuery(searchParams);
    const supabase = createPublicSupabaseClient();
    const data = await getProgramPage(supabase, query);

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ProgramQueryError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error in GET /api/program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program events" },
      { status: 500 }
    );
  }
}
