import { getCachedArchiveYear } from "@/lib/about/cached-about-data";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  props: { params: Promise<{ year: string }> }
) {
  try {
    const { year: yearParam } = await props.params;
    const year = Number(yearParam);

    if (!Number.isFinite(year)) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const section = await getCachedArchiveYear(year);

    if (!section) {
      return NextResponse.json({ error: "Year not found" }, { status: 404 });
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Error in GET /api/about/archive/[year]:", error);
    return NextResponse.json(
      { error: "Failed to fetch archive year" },
      { status: 500 }
    );
  }
}
