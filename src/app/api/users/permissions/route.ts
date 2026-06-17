import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import {
  getPlatformModStatus,
  setPlatformMod,
} from "@/lib/permissions/set-platform-mod";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  targetUserId: z.string().uuid(),
  is_mod: z.boolean(),
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

    const isModerator = await getIsPlatformMod(supabase, user.id);
    if (!isModerator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId");
    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }

    const status = await getPlatformModStatus(targetUserId);
    return NextResponse.json({ targetUserId, ...status });
  } catch (err) {
    console.error("GET /api/users/permissions:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load permissions" },
      { status: 500 }
    );
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

    const isModerator = await getIsPlatformMod(supabase, user.id);
    if (!isModerator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { targetUserId, is_mod } = parsed.data;

    if (targetUserId === user.id && is_mod) {
      return NextResponse.json(
        { error: "Cannot grant moderator to yourself via this endpoint" },
        { status: 400 }
      );
    }

    const result = await setPlatformMod(targetUserId, is_mod, user.id);
    return NextResponse.json({ targetUserId, ...result });
  } catch (err) {
    console.error("PATCH /api/users/permissions:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update permissions" },
      { status: 500 }
    );
  }
}
