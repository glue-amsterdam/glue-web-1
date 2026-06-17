export const getParticipantDisplayName = (row: {
  display_name?: string | null;
  user_name?: string | null;
}): string =>
  row.display_name?.trim() ||
  row.user_name?.trim() ||
  "Unknown User";
