import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { YEAR_NUMBER_LABELS } from "@/lib/year-numbers/year-number-labels";
import { revalidateYearNumbersCache } from "@/lib/year-numbers/revalidate-year-numbers-cache";
import { revalidateAboutArchiveYearCache } from "@/lib/about/revalidate-about-cache";
import { devLog } from "@/lib/dev-log";
import { NextResponse } from "next/server";
import { z } from "zod";

const createYearSchema = z.object({
  year: z.number().int(),
  items: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
});

export async function GET() {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { data, error } = await auth.supabase
      .from("year_numbers")
      .select("year")
      .order("year", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ years: (data ?? []).map((row) => row.year) });
  } catch (error) {
    console.error("Error in GET /api/admin/year-numbers:", error);
    return NextResponse.json(
      { error: "Failed to fetch year numbers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const validated = createYearSchema.parse(body);

    const { data: yearRow, error: yearError } = await auth.supabase
      .from("year_numbers")
      .insert({ year: validated.year })
      .select("id")
      .single();

    if (yearError || !yearRow) {
      devLog("year-numbers-api", "POST:insert-year-failed", {
        year: validated.year,
        yearError,
      });
      throw yearError;
    }

    const items =
      validated.items ??
      YEAR_NUMBER_LABELS.map((label, index) => ({
        label,
        value: "",
        display_order: index,
      }));

    const { error: itemsError } = await auth.supabase
      .from("year_number_items")
      .insert(
        items.map((item, index) => ({
          year_numbers_id: yearRow.id,
          label: item.label,
          value: item.value,
          display_order: index,
        }))
      );

    if (itemsError) {
      devLog("year-numbers-api", "POST:insert-items-failed", {
        year: validated.year,
        itemsError,
      });
      throw itemsError;
    }

    revalidateYearNumbersCache(validated.year);
    revalidateAboutArchiveYearCache(validated.year);

    devLog("year-numbers-api", "POST:ok", {
      year: validated.year,
      itemCount: items.length,
    });
    return NextResponse.json({ message: "Year numbers created", year: validated.year });
  } catch (error) {
    devLog("year-numbers-api", "POST:error", { error });
    console.error("Error in POST /api/admin/year-numbers:", error);
    return NextResponse.json(
      { error: "Failed to create year numbers" },
      { status: 500 }
    );
  }
}
