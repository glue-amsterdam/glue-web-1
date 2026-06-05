import { resolveVisitorDataSubjectAuthId } from "@/lib/dashboard/resolve-visitor-data-subject";
import { getAuthUserEmail } from "@/lib/users/get-auth-user-email";
import {
  ensureVisitorDataForAuthUser,
  loadVisitorHintsForAuthUser,
} from "@/lib/visitor/ensure-visitor-data";
import { mapVisitorRowToProfileResponse } from "@/lib/visitor/map-visitor-row-to-profile";
import { visitorProfileSchema } from "@/schemas/visitorSchemas";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchBodySchema = visitorProfileSchema.extend({
  targetUserId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId");

    const { authUserId, status } = await resolveVisitorDataSubjectAuthId(
      supabase,
      user.id,
      targetUserId
    );

    if (status === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subjectEmail =
      authUserId === user.id
        ? user.email
        : await getAuthUserEmail(authUserId);

    const hints = await loadVisitorHintsForAuthUser(authUserId, subjectEmail);
    const row = await ensureVisitorDataForAuthUser(
      authUserId,
      hints,
      subjectEmail
    );

    return NextResponse.json({
      profile: mapVisitorRowToProfileResponse(row, subjectEmail),
      subjectUserId: authUserId,
    });
  } catch (err) {
    console.error("GET /api/users/visitor-data:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = patchBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { targetUserId, firstName, lastName, email, birthDate, areaId } =
      parsed.data;

    const { authUserId, status } = await resolveVisitorDataSubjectAuthId(
      supabase,
      user.id,
      targetUserId ?? null
    );

    if (status === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const admin = await createAdminClient();

    const { data: existing } = await admin
      .from("visitor_data")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      full_name: fullName,
      birth_date: birthDate?.trim() ? birthDate.trim() : null,
      area_id: areaId?.trim() ? areaId.trim() : null,
    };

    const subjectEmail =
      authUserId === user.id
        ? user.email
        : await getAuthUserEmail(authUserId);

    if (existing?.id) {
      const { data: updated, error } = await admin
        .from("visitor_data")
        .update(payload)
        .eq("id", existing.id)
        .select(
          "id, email, first_name, last_name, full_name, display_name, birth_date, area_id"
        )
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        profile: mapVisitorRowToProfileResponse(updated, subjectEmail),
        subjectUserId: authUserId,
      });
    }

    const hints = await loadVisitorHintsForAuthUser(authUserId, subjectEmail);
    const row = await ensureVisitorDataForAuthUser(
      authUserId,
      {
        ...hints,
        email: email.toLowerCase(),
        displayName: fullName,
      },
      subjectEmail
    );

    const { data: updated, error } = await admin
      .from("visitor_data")
      .update(payload)
      .eq("id", row.id)
      .select(
        "id, email, first_name, last_name, full_name, display_name, birth_date, area_id"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      profile: mapVisitorRowToProfileResponse(updated, subjectEmail),
      subjectUserId: authUserId,
    });
  } catch (err) {
    console.error("PATCH /api/users/visitor-data:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
