import { isDataDebugEnabled } from "@/lib/data-debug";
import { isScanDayToday, isValidIanaTimeZone } from "@/lib/scan/is-scan-day-today";

export const isScanDayCheckBypassed = (): boolean => isDataDebugEnabled();

export type ScanDayGuardResult =
  | { ok: true }
  | { ok: false; error: string; code: string };

export const assertScanDayAllowed = (
  eventDayDate: string | null,
  timeZone: string | undefined,
): ScanDayGuardResult => {
  if (isScanDayCheckBypassed()) {
    return { ok: true };
  }

  if (!timeZone?.trim() || !isValidIanaTimeZone(timeZone)) {
    return {
      ok: false,
      error: "A valid device timezone is required for scanning.",
      code: "invalid_time_zone",
    };
  }

  if (!eventDayDate) {
    return {
      ok: false,
      error: "Event day has no date configured.",
      code: "missing_event_day_date",
    };
  }

  if (!isScanDayToday(eventDayDate, timeZone)) {
    return {
      ok: false,
      error: "Scanning is only available on the event day.",
      code: "scan_day_mismatch",
    };
  }

  return { ok: true };
};
