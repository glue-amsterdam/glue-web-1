import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import { getExhibitorHubById } from "@/lib/participants/get-exhibitor-hub-by-id";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hubId: string }> }
) {
  try {
    const { hubId } = await params;
    const supabase = await createClient();
    const exhibitor = await getExhibitorHubById(supabase, hubId);
    return NextResponse.json(exhibitor, { status: 200 });
  } catch (error) {
    if (error instanceof ExhibitorNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error fetching exhibitor hub:", error);
    return NextResponse.json(
      { error: "Failed to fetch exhibitor hub" },
      { status: 500 }
    );
  }
}
