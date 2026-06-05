export const getDashboardHomePath = (
  userId: string,
  options: { isParticipant: boolean }
): string =>
  options.isParticipant
    ? `/dashboard/${userId}/participant-details`
    : `/dashboard/${userId}/visitor-data`;
