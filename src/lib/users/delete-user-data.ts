import { config } from "@/config";
import type { SupabaseClient } from "@supabase/supabase-js";

export const deleteUserStorage = async (
  supabase: SupabaseClient,
  userId: string,
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
        (file: { name: string }) => `${path}/${file.name}`,
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
        `Error deleting folder ${path}: ${folderDeleteError.message}`,
      );
    }
  }

  return errors;
};

const deleteRowsByUserColumn = async (
  supabase: SupabaseClient,
  table: string,
  column: string,
  userId: string,
) => {
  const { error } = await supabase.from(table).delete().eq(column, userId);
  if (error) throw error;
};

export const deleteUserRelatedRows = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const { error: grantClearError } = await supabase
    .from("user_permissions")
    .update({ granted_by: null })
    .eq("granted_by", userId);
  if (grantClearError) throw grantClearError;

  const { data: visitorRow } = await supabase
    .from("visitor_data")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (visitorRow?.id) {
    await deleteRowsByUserColumn(
      supabase,
      "event_attendance",
      "visitor_id",
      visitorRow.id,
    );
    await deleteRowsByUserColumn(
      supabase,
      "location_day_attendance",
      "visitor_id",
      visitorRow.id,
    );
  }

  const deletions: Array<{ table: string; column: string }> = [
    { table: "visiting_hours", column: "user_id" },
    { table: "events", column: "organizer_id" },
    { table: "route_dots", column: "user_id" },
    { table: "routes", column: "user_id" },
    { table: "hub_participants", column: "user_id" },
    { table: "hubs", column: "hub_host_id" },
    { table: "sticky_group_participants", column: "participant_user_id" },
    { table: "participant_image", column: "user_id" },
    { table: "map_info", column: "user_id" },
    { table: "invoice_data", column: "user_id" },
    { table: "participant_details", column: "user_id" },
    { table: "visitor_data", column: "auth_user_id" },
    { table: "user_permissions", column: "user_id" },
    { table: "user_info", column: "user_id" },
  ];

  for (const { table, column } of deletions) {
    await deleteRowsByUserColumn(supabase, table, column, userId);
  }
};

export const deleteAuthUser = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
};
