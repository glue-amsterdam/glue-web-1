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

export async function POST(request: Request) {
  const supabaseSession = await createClient();
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isModerator = await getIsPlatformMod(supabaseSession, user.id);
  if (!isModerator) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const supabase = await createAdminClient();
  const { userIds } = await request.json();

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ message: "Invalid userIds" }, { status: 400 });
  }

  const deletedUsers: string[] = [];
  const failedDeletions: Array<{ userId: string; error: string }> = [];
  const errors: string[] = [];

  try {
    for (const userId of userIds) {
      try {
        const storageErrors = await deleteUserStorage(
          supabase as SupabaseClient,
          userId,
        );
        errors.push(...storageErrors);

        await deleteUserRelatedRows(supabase as SupabaseClient, userId);
        await deleteAuthUser(supabase as SupabaseClient, userId);

        deletedUsers.push(userId);
      } catch (error) {
        failedDeletions.push({
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (failedDeletions.length > 0 || errors.length > 0) {
      return NextResponse.json(
        {
          message: "Some operations failed during user deletion",
          deletedUsers,
          failedDeletions,
          errors,
        },
        { status: 207 },
      );
    }

    return NextResponse.json(
      {
        message: "All users and associated data deleted successfully",
        deletedUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error during user deletion:", error);
    return NextResponse.json(
      {
        message: "Failed to delete users",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
