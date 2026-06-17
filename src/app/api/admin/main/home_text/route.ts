import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mapHomeTextFromRow } from "@/lib/main/map-home-text-row";
import { revalidateSiteThemeCache } from "@/lib/main/revalidate-site-theme-cache";
import {
  homeTextsFormSchema,
  homeTextsSaveSchema,
  type HomeTextPlacement,
} from "@/schemas/mainSchema";

const FOOTER_PLACEMENTS: HomeTextPlacement[] = ["footer_left", "footer_right"];

const requireAdmin = async () => {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  return null;
};

const validateFooterSlotUniqueness = (
  homeTexts: Array<{ placement: HomeTextPlacement; id?: string }>
) => {
  for (const placement of FOOTER_PLACEMENTS) {
    const matches = homeTexts.filter((item) => item.placement === placement);
    if (matches.length > 1) {
      return `Only one row is allowed for placement "${placement}"`;
    }
  }

  return null;
};

const countRowsByPlacement = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  placement: HomeTextPlacement
) => {
  const { count, error } = await supabase
    .from("home_text")
    .select("id", { count: "exact", head: true })
    .eq("placement", placement);

  if (error) {
    throw error;
  }

  return count ?? 0;
};

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const supabase = await createClient();
    const body = await request.json();
    const requestedPlacement: HomeTextPlacement =
      body.placement === "footer_left" ||
      body.placement === "footer_right" ||
      body.placement === "marquee"
        ? body.placement
        : "marquee";

    if (requestedPlacement === "marquee") {
      // Marquee rows can always be created.
    } else if (FOOTER_PLACEMENTS.includes(requestedPlacement)) {
      const existingCount = await countRowsByPlacement(
        supabase,
        requestedPlacement
      );
      if (existingCount > 0) {
        return NextResponse.json(
          {
            error: `Only one row is allowed for placement "${requestedPlacement}"`,
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid placement" },
        { status: 400 }
      );
    }

    const parsed = {
      label: typeof body.label === "string" ? body.label : "",
      color: body.color ?? null,
      href: body.href ?? null,
      placement: requestedPlacement,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    };

    const { data, error } = await supabase
      .from("home_text")
      .insert([
        {
          label: parsed.label,
          color: parsed.color ?? null,
          href: parsed.href ?? null,
          placement: parsed.placement,
          sort_order: parsed.sort_order,
        },
      ])
      .select("id, label, color, href, placement, sort_order")
      .single();

    if (error) {
      throw error;
    }

    revalidateSiteThemeCache();

    return NextResponse.json(mapHomeTextFromRow(data));
  } catch (error) {
    console.error("Error in POST /api/admin/main/home_text:", error);
    return NextResponse.json(
      { error: "Failed to create home text" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const supabase = await createClient();
    const body = await request.json();
    const validated = homeTextsSaveSchema.parse(body);
    const slotError = validateFooterSlotUniqueness(validated.homeTexts);

    if (slotError) {
      return NextResponse.json({ error: slotError }, { status: 400 });
    }

    for (const item of validated.homeTexts) {
      if (!item.id) {
        return NextResponse.json(
          { error: "Each home text row must include an id" },
          { status: 400 }
        );
      }

      const { data: existing, error: existingError } = await supabase
        .from("home_text")
        .select("placement")
        .eq("id", item.id)
        .single();

      if (existingError || !existing) {
        return NextResponse.json(
          { error: `Home text row not found: ${item.id}` },
          { status: 404 }
        );
      }

      if (existing.placement !== item.placement) {
        return NextResponse.json(
          { error: "Placement cannot be changed after creation" },
          { status: 400 }
        );
      }
    }

    const updatedRows = await Promise.all(
      validated.homeTexts.map(async (item, index) => {
        const { data, error } = await supabase
          .from("home_text")
          .update({
            label: item.label,
            color: item.color ?? null,
            href: item.href ?? null,
            placement: item.placement,
            sort_order: index,
          })
          .eq("id", item.id)
          .select("id, label, color, href, placement, sort_order")
          .single();

        if (error) {
          throw error;
        }

        return mapHomeTextFromRow(data);
      })
    );

    revalidateSiteThemeCache();

    return NextResponse.json(homeTextsFormSchema.parse({ homeTexts: updatedRows }));
  } catch (error) {
    console.error("Error in PUT /api/admin/main/home_text:", error);
    return NextResponse.json(
      { error: "Failed to update home texts" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("home_text")
      .select("placement")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Home text row not found" },
        { status: 404 }
      );
    }

    if (
      existing.placement === "footer_left" ||
      existing.placement === "footer_right"
    ) {
      return NextResponse.json(
        { error: "Footer text rows cannot be deleted" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("home_text").delete().eq("id", id);

    if (error) {
      throw error;
    }

    revalidateSiteThemeCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/main/home_text:", error);
    return NextResponse.json(
      { error: "Failed to delete home text" },
      { status: 500 }
    );
  }
}
