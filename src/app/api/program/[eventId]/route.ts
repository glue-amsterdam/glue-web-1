import { getProgramDetail } from "@/lib/program/get-program-detail";
import { ProgramNotFoundError } from "@/lib/program/program-types";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  if (!eventId) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const detail = await getProgramDetail(supabase, eventId);
    return NextResponse.json(detail);
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error in GET /api/program/[eventId]:", error);
    return NextResponse.json(
      { error: "Failed to fetch program event" },
      { status: 500 }
    );
  }
}
