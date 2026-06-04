import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import { getExhibitorBySlug } from "@/lib/participants/get-exhibitor-by-slug";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const exhibitor = await getExhibitorBySlug(supabase, slug);
    return NextResponse.json(exhibitor, { status: 200 });
  } catch (error) {
    if (error instanceof ExhibitorNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error fetching exhibitor by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch exhibitor" },
      { status: 500 }
    );
  }
}
