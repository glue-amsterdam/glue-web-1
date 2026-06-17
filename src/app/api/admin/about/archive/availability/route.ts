import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");

  if (!yearParam) {
    return NextResponse.json({ error: "year is required" }, { status: 400 });
  }

  const year = Number(yearParam);
  if (Number.isNaN(year)) {
    return NextResponse.json({ error: "year must be a number" }, { status: 400 });
  }

  try {
    const { count: citizensCount, error: citizensError } = await auth.supabase
      .from("about_citizens")
      .select("*", { count: "exact", head: true })
      .eq("year", String(year));

    if (citizensError) {
      throw citizensError;
    }

    const { data: stickyGroup, error: stickyError } = await auth.supabase
      .from("sticky_groups")
      .select("id")
      .eq("year", year)
      .maybeSingle();

    if (stickyError) {
      throw stickyError;
    }

    let stickyCount = 0;
    if (stickyGroup?.id) {
      const { count, error: participantsError } = await auth.supabase
        .from("sticky_group_participants")
        .select("*", { count: "exact", head: true })
        .eq("sticky_group_id", stickyGroup.id);

      if (participantsError) {
        throw participantsError;
      }
      stickyCount = count ?? 0;
    }

    const { data: yearNumbers, error: yearNumbersError } = await auth.supabase
      .from("year_numbers")
      .select("id")
      .eq("year", year)
      .maybeSingle();

    if (yearNumbersError) {
      throw yearNumbersError;
    }

    return NextResponse.json({
      year,
      citizens: {
        available: (citizensCount ?? 0) > 0,
        count: citizensCount ?? 0,
      },
      sticky: {
        available: stickyCount > 0,
        count: stickyCount,
      },
      year_numbers: {
        configured: Boolean(yearNumbers),
      },
    });
  } catch (error) {
    console.error("Error in GET archive availability:", error);
    return NextResponse.json(
      { error: "Failed to check archive availability" },
      { status: 500 }
    );
  }
}
