import { requireAdminToken } from "@/lib/admin/require-admin-token";
import {
  fetchAllYearlyContentYears,
  fetchYearlyContentStatus,
} from "@/lib/admin/fetch-yearly-content-status";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");

  try {
    const years = await fetchAllYearlyContentYears(auth.supabase);

    if (!yearParam) {
      return NextResponse.json({ years });
    }

    const year = Number(yearParam);
    if (Number.isNaN(year)) {
      return NextResponse.json(
        { error: "year must be a number" },
        { status: 400 }
      );
    }

    const status = await fetchYearlyContentStatus(auth.supabase, year);

    return NextResponse.json({ years, status });
  } catch (error) {
    console.error("Error in GET yearly-content summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch yearly content summary" },
      { status: 500 }
    );
  }
}
