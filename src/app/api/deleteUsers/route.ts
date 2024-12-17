import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { SupabaseClient } from "@supabase/supabase-js";

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
    // First, fetch all map_info_ids associated with the users
    const { data: mapInfos, error: mapInfoError } = await supabase
      .from("map_info")
      .select("id")
      .in("user_id", userIds);

    if (mapInfoError) {
      errors.push(`Error fetching map_info: ${mapInfoError.message}`);
    }

    const mapInfoIds = mapInfos?.map((info) => info.id) || [];

    // Updated deletion order respecting foreign key constraints
    const deletionOrder = [
      { table: "route_dots", column: "map_info_id", ids: mapInfoIds },
      { table: "participant_image", column: "user_id", ids: userIds }, // Dependent table
      { table: "hub_participants", column: "user_id", ids: userIds },
      { table: "participant_details", column: "user_id", ids: userIds },
      { table: "visiting_hours", column: "user_id", ids: userIds },
      { table: "invoice_data", column: "user_id", ids: userIds },
      { table: "events", column: "organizer_id", ids: userIds },
      { table: "map_info", column: "user_id", ids: userIds },
      { table: "hubs", column: "hub_host_id", ids: userIds }, // Extra check
      { table: "user_info", column: "user_id", ids: userIds }, // Delete last
    ];

    for (const { table, column, ids } of deletionOrder) {
      if (ids.length > 0) {
        const { error } = await supabase.from(table).delete().in(column, ids);

        if (error) {
          console.error(`Error deleting from ${table}:`, error.message);
          errors.push(`Error deleting from ${table}: ${error.message}`);
        }
      }
    }

    // Delete storage items
    async function deleteUserStorage(supabase: SupabaseClient, userId: string) {
      const bucketName = "amsterdam-assets";
      const folders = ["profile-images", "events"];
      const errors = [];

      for (const folder of folders) {
        const path = `${folder}/${userId}`;

        // List all objects in the folder
        const { data: files, error: listError } = await supabase.storage
          .from(bucketName)
          .list(path);

        if (listError) {
          errors.push(`Error listing files in ${path}: ${listError.message}`);
          continue;
        }

        if (files && files.length > 0) {
          // Delete all files in the folder
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

        // Attempt to remove the empty folder
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
      const storageErrors = await deleteUserStorage(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as SupabaseClient<any, "public", any>,
        userId
      );
      errors.push(...storageErrors);
    }

    // Delete auth users
    for (const userId of userIds) {
      try {
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
