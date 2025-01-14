import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/env";

export async function POST(request: Request) {
  const supabase = await createAdminClient();
  const { userIds } = await request.json();

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ message: "Invalid userIds" }, { status: 400 });
  }

  const deletedUsers = [];
  const failedDeletions = [];
  const errors = [];

  try {
    // Delete storage items
    async function deleteUserStorage(supabase: SupabaseClient, userId: string) {
      const bucketName = config.bucketName;
      const folders = ["profile-images", "events"];
      const errors = [];

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
            errors.push(
              `Error deleting files in ${path}: ${deleteError.message}`
            );
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
    }

    for (const userId of userIds) {
      try {
        // Delete user's storage items
        const storageErrors = await deleteUserStorage(
          supabase as SupabaseClient,
          userId
        );
        errors.push(...storageErrors);

        // Delete user from user_info table
        // This will trigger cascading deletes for all related tables
        const { error: userInfoError } = await supabase
          .from("user_info")
          .delete()
          .eq("user_id", userId);

        if (userInfoError) throw userInfoError;

        // Delete auth user
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

    // Determine response based on results
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
    } else {
      return NextResponse.json(
        {
          message: "All users and associated data deleted successfully",
          deletedUsers,
        },
        { status: 200 }
      );
    }
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
