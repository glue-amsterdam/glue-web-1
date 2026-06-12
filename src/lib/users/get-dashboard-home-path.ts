export const getDashboardHomePath = (
  userId: string,
  options: { isParticipant: boolean; isPendingParticipant?: boolean }
): string => {
  if (options.isPendingParticipant) {
    return `/dashboard/${userId}/visitor-data`;
  }

  return options.isParticipant
    ? `/dashboard/${userId}/participant-details`
    : `/dashboard/${userId}/visitor-data`;
};
