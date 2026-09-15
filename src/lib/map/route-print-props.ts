import type { RouteStopDisplay } from "@/lib/map/route-stop-display";

export type RoutePrintProps = {
  routeName: string;
  routeDescription?: string;
  mapImageDataUrl: string;
  stops: RouteStopDisplay[];
  primaryColor: string;
  logoSrc: string;
  /** Formatted event date range (or empty until wired). */
  eventDate: string;
};

export type EventDayLike = {
  date: string | null;
  label: string;
};

/**
 * Builds a human-readable event date range from sorted event days.
 * Example: "16–19 January 2025"
 */
export const formatEventDateRange = (days: EventDayLike[]): string => {
  const timestamps = days
    .map((day) => (day.date ? Date.parse(day.date) : Number.NaN))
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b);

  if (timestamps.length === 0) return "";

  const start = new Date(timestamps[0]);
  const end = new Date(timestamps[timestamps.length - 1]);

  const sameDay =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate();

  if (sameDay) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(start);
  }

  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      timeZone: "UTC",
    });
    const monthYearFormatter = new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    return `${dayFormatter.format(start)}–${dayFormatter.format(end)} ${monthYearFormatter.format(end)}`;
  }

  const fullFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${fullFormatter.format(start)} – ${fullFormatter.format(end)}`;
};
