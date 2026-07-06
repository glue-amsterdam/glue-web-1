import { fetchProgramPage } from "@/lib/program/fetch-program-page";
import { parseProgramQuery, ProgramQueryError } from "@/lib/program/program-query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseProgramQuery(searchParams);
    const data = await fetchProgramPage({
      limit: query.limit,
      offset: query.offset,
      type: query.type,
      day: query.day,
      q: query.q,
    });

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
