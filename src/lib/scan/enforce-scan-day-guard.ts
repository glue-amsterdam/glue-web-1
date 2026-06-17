import { assertScanDayAllowed } from "@/lib/scan/scan-day-guard";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const getEventDayDateByDayId = async (
  supabase: SupabaseClient,
  dayId: string,
): Promise<string | null> => {
  const { data, error } = await supabase
    .from("events_days")
    .select("date")
    .eq("dayId", dayId)
    .maybeSingle();

  if (error) {
    console.error("getEventDayDateByDayId:", error);
    return null;
  }

  return (data?.date as string | null) ?? null;
};

export const getEventDayDateForEvent = async (
  supabase: SupabaseClient,
  eventId: string,
): Promise<{ dayId: string | null; date: string | null }> => {
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("dayId")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event?.dayId) {
    return { dayId: null, date: null };
  }

  const date = await getEventDayDateByDayId(supabase, event.dayId as string);
  return { dayId: event.dayId as string, date };
};

export const enforceScanDayGuard = async (
  supabase: SupabaseClient,
  dayId: string,
  timeZone: string | undefined,
) => {
  const date = await getEventDayDateByDayId(supabase, dayId);
  const guard = assertScanDayAllowed(date, timeZone);

  if (!guard.ok) {
    const status = guard.code === "scan_day_mismatch" ? 403 : 400;
    return NextResponse.json({ error: guard.error, code: guard.code }, { status });
  }

  return null;
};
