import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { config } from "@/config";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const deleteUserStorage = async (
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> => {
  const bucketName = config.bucketName;
  const folders = ["profile-images", "events"];
  const errors: string[] = [];

  for (const folder of folders) {
    const path = `${folder}/${userId}`;

    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(path);

    if (listError) {
      errors.push(`Error listing files in ${path}: ${listError.message}`);
      continue;
    }

    if (files && files.length > 0) {
      const filesToDelete = files.map(
        (file: { name: string }) => `${path}/${file.name}`
      );
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(filesToDelete);

      if (deleteError) {
        errors.push(`Error deleting files in ${path}: ${deleteError.message}`);
      }
    }

    const { error: folderDeleteError } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (folderDeleteError) {
      errors.push(
        `Error deleting folder ${path}: ${folderDeleteError.message}`
      );
    }
  }

  return errors;
};

const deleteUserRelatedRows = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const tables = [
    "sticky_group_participants",
    "visiting_hours",
    "map_info",
    "invoice_data",
    "participant_details",
    "visitor_data",
    "user_permissions",
  ] as const;

  for (const table of tables) {
    if (table === "sticky_group_participants") {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("participant_user_id", userId);
      if (error) throw error;
      continue;
    }

    const column = table === "visitor_data" ? "auth_user_id" : "user_id";
    const { error } = await supabase.from(table).delete().eq(column, userId);
    if (error) throw error;
  }
};

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
          userId
        );
        errors.push(...storageErrors);

        await deleteUserRelatedRows(supabase as SupabaseClient, userId);

        const { error: authError } = await supabase.auth.admin.deleteUser(
          userId
        );
        if (authError) throw authError;

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
        { status: 207 }
      );
    }

    return NextResponse.json(
      {
        message: "All users and associated data deleted successfully",
        deletedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error during user deletion:", error);
    return NextResponse.json(
      {
        message: "Failed to delete users",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
