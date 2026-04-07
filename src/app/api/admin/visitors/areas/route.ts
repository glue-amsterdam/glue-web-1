import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/adminClient";

const createAreaSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
});

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

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("visitor_areas")
      .select("id, name, created_at")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ areas: data ?? [] });
  } catch (err) {
    console.error("Error in GET /api/admin/visitors/areas:", err);
    return NextResponse.json(
      { error: "Failed to fetch work areas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const json = await request.json();
    const parsed = createAreaSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("visitor_areas")
      .insert({ name: parsed.data.name })
      .select("id, name, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A work area with this name already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ area: data });
  } catch (err) {
    console.error("Error in POST /api/admin/visitors/areas:", err);
    return NextResponse.json(
      { error: "Failed to create work area" },
      { status: 500 }
    );
  }
}
