const CALENDAR_DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const normalizeEventDayDate = (eventDayDate: string | null): string | null => {
  if (!eventDayDate?.trim()) return null;

  const trimmed = eventDayDate.trim();
  const isoDatePrefix = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDatePrefix) {
    return isoDatePrefix[1];
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return CALENDAR_DATE_FORMAT.format(parsed);
};

export const getTodayCalendarDate = (timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export const isScanDayToday = (
  eventDayDate: string | null,
  timeZone: string,
): boolean => {
  const normalizedDay = normalizeEventDayDate(eventDayDate);
  if (!normalizedDay) return false;

  const today = getTodayCalendarDate(timeZone);
  return normalizedDay === today;
};

export const isValidIanaTimeZone = (timeZone: string): boolean =>
  /^[A-Za-z_]+\/[A-Za-z0-9_+-]+$/.test(timeZone.trim());
