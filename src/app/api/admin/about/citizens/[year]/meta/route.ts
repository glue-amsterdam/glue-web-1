import { revalidateHomeCitizensCache } from "@/lib/home";
import {
  fetchCitizensYearMeta,
  upsertCitizensYearMeta,
} from "@/lib/citizens/fetch-citizens-year-meta";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { yearlySectionHeaderSchema } from "@/schemas/yearly-section-header-schema";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const params = await props.params;
  const yearInt = parseInt(params.year, 10);

  if (Number.isNaN(yearInt)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const auth = await requireAdminToken();
    if (!auth.ok) {
      return auth.response;
    }

    const meta = await fetchCitizensYearMeta(auth.supabase, yearInt);
    return NextResponse.json(meta);
  } catch (error) {
    console.error(`Error fetching citizens meta for year ${params.year}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch citizens meta for year ${params.year}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const params = await props.params;
  const yearInt = parseInt(params.year, 10);

  if (Number.isNaN(yearInt)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const auth = await requireAdminToken();
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const validated = yearlySectionHeaderSchema.parse(body);

    await upsertCitizensYearMeta(auth.supabase, {
      year: yearInt,
      title: validated.title,
      description: validated.description,
    });

    revalidateHomeCitizensCache(yearInt);

    return NextResponse.json({
      year: yearInt,
      title: validated.title,
      description: validated.description,
    });
  } catch (error) {
    console.error(`Error updating citizens meta for year ${params.year}:`, error);
    return NextResponse.json(
      { error: `Failed to update citizens meta for year ${params.year}` },
      { status: 500 }
    );
  }
}
