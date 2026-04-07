import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/adminClient";

const updateAreaSchema = z.object({
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

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const idParse = z.string().uuid().safeParse(id);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid work area id" }, { status: 400 });
  }

  try {
    const json = await request.json();
    const parsed = updateAreaSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("visitor_areas")
      .update({ name: parsed.data.name })
      .eq("id", idParse.data)
      .select("id, name, created_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Work area not found" },
          { status: 404 }
        );
      }
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
    console.error("Error in PATCH /api/admin/visitors/areas/[id]:", err);
    return NextResponse.json(
      { error: "Failed to update work area" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const idParse = z.string().uuid().safeParse(id);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid work area id" }, { status: 400 });
  }

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("visitor_areas")
      .delete()
      .eq("id", idParse.data)
      .select("id");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Work area not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/admin/visitors/areas/[id]:", err);
    return NextResponse.json(
      { error: "Failed to delete work area" },
      { status: 500 }
    );
  }
}
