export type ScannableEventRow = {
  id: string;
  title: string;
  type: string;
  dayId: string;
  start_time: string;
  end_time: string;
  location_id: string;
  organizer_id: string;
};

export type EventScanPermissionInput = {
  organizer_id: string;
  co_organizers: string[] | null;
  location_id: string;
};

export const isEventOrganizerOrCoOrganizer = (
  userId: string,
  event: Pick<EventScanPermissionInput, "organizer_id" | "co_organizers">,
): boolean => {
  const coOrganizers = Array.isArray(event.co_organizers) ? event.co_organizers : [];
  return event.organizer_id === userId || coOrganizers.includes(userId);
};

export const isEventScanAllowed = (
  userId: string,
  event: EventScanPermissionInput,
  hostedLocationIds: string[],
): boolean => {
  if (isEventOrganizerOrCoOrganizer(userId, event)) {
    return true;
  }

  return hostedLocationIds.includes(event.location_id);
};
