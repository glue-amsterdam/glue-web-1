import { getCachedTerms } from "@/lib/terms/get-cached-terms";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const content = await getCachedTerms();
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error in GET /api/terms:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching terms and conditions" },
      { status: 500 }
    );
  }
}
