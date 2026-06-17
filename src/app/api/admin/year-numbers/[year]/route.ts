import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidateAboutArchiveYearCache } from "@/lib/about/revalidate-about-cache";
import { revalidateYearNumbersCache } from "@/lib/year-numbers/revalidate-year-numbers-cache";
import { devLog } from "@/lib/dev-log";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

export async function GET(
  _request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { year: yearParam } = await props.params;
  const year = Number(yearParam);

  try {
    const { data: yearRow, error: yearError } = await auth.supabase
      .from("year_numbers")
      .select("id, year")
      .eq("year", year)
      .maybeSingle();

    if (yearError) {
      throw yearError;
    }

    if (!yearRow) {
      devLog("year-numbers-api", "GET:not-configured", { year });
      return NextResponse.json({ configured: false, year, items: [] });
    }

    const { data: items, error: itemsError } = await auth.supabase
      .from("year_number_items")
      .select("label, value, display_order")
      .eq("year_numbers_id", yearRow.id)
      .order("display_order");

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json({
      configured: true,
      year: yearRow.year,
      items: items ?? [],
    });
  } catch (error) {
    devLog("year-numbers-api", "GET:error", { year, error });
    console.error(`Error in GET /api/admin/year-numbers/${yearParam}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch year numbers" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { year: yearParam } = await props.params;
  const year = Number(yearParam);

  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const { data: yearRow, error: yearError } = await auth.supabase
      .from("year_numbers")
      .select("id")
      .eq("year", year)
      .single();

    if (yearError || !yearRow) {
      devLog("year-numbers-api", "PUT:not-found", { year, yearError });
      return NextResponse.json({ error: "Year not found" }, { status: 404 });
    }

    await auth.supabase
      .from("year_number_items")
      .delete()
      .eq("year_numbers_id", yearRow.id);

    if (validated.items.length > 0) {
      const { error: insertError } = await auth.supabase
        .from("year_number_items")
        .insert(
          validated.items.map((item, index) => ({
            year_numbers_id: yearRow.id,
            label: item.label,
            value: item.value,
            display_order: index,
          }))
        );

      if (insertError) {
        throw insertError;
      }
    }

    revalidateYearNumbersCache(year);
    revalidateAboutArchiveYearCache(year);

    devLog("year-numbers-api", "PUT:ok", { year, itemCount: validated.items.length });
    return NextResponse.json({ message: "Year numbers updated" });
  } catch (error) {
    devLog("year-numbers-api", "PUT:error", { year, error });
    console.error(`Error in PUT /api/admin/year-numbers/${yearParam}:`, error);
    return NextResponse.json(
      { error: "Failed to update year numbers" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { year: yearParam } = await props.params;
  const year = Number(yearParam);

  try {
    const { error } = await auth.supabase
      .from("year_numbers")
      .delete()
      .eq("year", year);

    if (error) {
      throw error;
    }

    revalidateYearNumbersCache(year);
    revalidateAboutArchiveYearCache(year);

    return NextResponse.json({ message: "Year numbers deleted" });
  } catch (error) {
    console.error(
      `Error in DELETE /api/admin/year-numbers/${yearParam}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to delete year numbers" },
      { status: 500 }
    );
  }
}
