import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import {
  deleteAuthUser,
  deleteUserRelatedRows,
  deleteUserStorage,
} from "@/lib/users/delete-user-data";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST() {
  const supabaseSession = await createClient();
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isModerator = await getIsPlatformMod(supabaseSession, user.id);
  if (isModerator) {
    return NextResponse.json(
      {
        message:
          "Platform moderators cannot delete their account through this endpoint.",
      },
      { status: 403 },
    );
  }

  const supabase = await createAdminClient();

  try {
    const storageErrors = await deleteUserStorage(
      supabase as SupabaseClient,
      user.id,
    );

    await deleteUserRelatedRows(supabase as SupabaseClient, user.id);
    await deleteAuthUser(supabase as SupabaseClient, user.id);

    if (storageErrors.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Account deleted with some storage cleanup warnings",
          errors: storageErrors,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json(
      {
        message: "Failed to delete account",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
