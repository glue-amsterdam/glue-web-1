type ParticipantDetailsEmbed =
  | { slug?: string | null }
  | Array<{ slug?: string | null }>
  | null
  | undefined;

type OrganizerParticipantDetailsEmbed =
  | {
      slug?: string | null;
      special_program?: boolean | null;
      display_number?: string | null;
    }
  | Array<{
      slug?: string | null;
      special_program?: boolean | null;
      display_number?: string | null;
    }>
  | null
  | undefined;

const firstFromParticipantEmbed = <T extends Record<string, unknown>>(
  participantDetails: OrganizerParticipantDetailsEmbed
): T | null => {
  if (!participantDetails) return null;
  if (Array.isArray(participantDetails)) {
    return (participantDetails[0] as T | undefined) ?? null;
  }
  return participantDetails as T;
};

export const slugFromEmbed = (
  participantDetails: ParticipantDetailsEmbed
): string => {
  if (!participantDetails) return "";
  if (Array.isArray(participantDetails)) {
    return participantDetails[0]?.slug ?? "";
  }
  return participantDetails.slug ?? "";
};

export const organizerBadgeFieldsFromEmbed = (
  participantDetails: OrganizerParticipantDetailsEmbed
): { specialProgram: boolean; displayNumber: string | null } => {
  const details = firstFromParticipantEmbed<{
    special_program?: boolean | null;
    display_number?: string | null;
  }>(participantDetails);

  return {
    specialProgram: details?.special_program ?? false,
    displayNumber: details?.display_number ?? null,
  };
};

export type EventDayRow = {
  dayId: string;
  label: string;
  date: string | null;
};

export const getCurrentTourStatus = async (
  supabase: import("@supabase/supabase-js").SupabaseClient
): Promise<string> => {
  const { data: tourStatus, error } = await supabase
    .from("tour_status")
    .select("current_tour_status, previous_tour_event_days")
    .single();

  if (error) {
    console.error("Error fetching tour status:", error);
    return "new";
  }

  return tourStatus?.current_tour_status || "new";
};

export const buildEventDaysMap = async (
  supabase: import("@supabase/supabase-js").SupabaseClient,
  currentTourStatus: string,
  uniqueDayIds: string[]
): Promise<Map<string, { label: string; date: string | null }>> => {
  const eventDaysMap = new Map<string, { label: string; date: string | null }>();

  if (uniqueDayIds.length === 0) {
    return eventDaysMap;
  }

  let eventDays: EventDayRow[] = [];

  if (currentTourStatus === "new") {
    const { data: eventDaysData, error: daysError } = await supabase
      .from("events_days")
      .select("dayId, label, date")
      .in("dayId", uniqueDayIds);

    if (daysError) {
      console.error("Error fetching event days:", daysError);
    } else {
      eventDays = eventDaysData || [];
    }
  } else if (currentTourStatus === "older") {
    const { data: tourStatusData, error: tourStatusError } = await supabase
      .from("tour_status")
      .select("previous_tour_event_days")
      .single();

    if (tourStatusError) {
      console.error("Error fetching tour status:", tourStatusError);
    } else {
      const snapshot = tourStatusData?.previous_tour_event_days as
        | EventDayRow[]
        | null;
      eventDays = (snapshot || []).filter((day) =>
        uniqueDayIds.includes(day.dayId)
      );
    }
  }

  for (const day of eventDays) {
    eventDaysMap.set(day.dayId, { label: day.label, date: day.date });
  }

  return eventDaysMap;
};

export const getEventDayForDetail = async (
  supabase: import("@supabase/supabase-js").SupabaseClient,
  currentTourStatus: string,
  dayId: string
): Promise<{ label: string; date: string | null } | null> => {
  if (!dayId || dayId === "day-off") return null;

  if (currentTourStatus === "new") {
    const { data: dayData, error: dayError } = await supabase
      .from("events_days")
      .select("dayId, label, date")
      .eq("dayId", dayId)
      .single();

    if (dayError || !dayData) return null;
    return { label: dayData.label, date: dayData.date };
  }

  if (currentTourStatus === "older") {
    const { data: tourStatusData, error: tourStatusError } = await supabase
      .from("tour_status")
      .select("previous_tour_event_days")
      .single();

    if (tourStatusError || !tourStatusData) return null;

    const snapshot = tourStatusData.previous_tour_event_days as
      | EventDayRow[]
      | null;
    const dayData = snapshot?.find((day) => day.dayId === dayId);
    if (!dayData) return null;
    return { label: dayData.label, date: dayData.date };
  }

  return null;
};
