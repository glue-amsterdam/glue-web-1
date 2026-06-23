"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, QrCode } from "lucide-react";
import { QrScanner, type QrScannerTarget } from "@/components/scan/qr-scanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EventDayForScan } from "@/lib/scan/get-qr-scan-page-data";
import type { ScannableEventRow } from "@/lib/scan/is-event-scan-allowed";
import { isScanDayToday } from "@/lib/scan/is-scan-day-today";
import { cn } from "@/lib/utils";

type QrScanClientProps = {
  eventDays: EventDayForScan[];
  events: ScannableEventRow[];
  hubHost: {
    isHubHost: boolean;
    hostedLocationIds: string[];
  };
  eventAttendanceCounts: Record<string, number>;
  locationDayCounts: Record<string, number>;
  debugEnabled: boolean;
  initialEventId?: string | null;
};

type ScanCard =
  | {
      id: string;
      kind: "venue";
      dayId: string;
      dayLabel: string;
      dayDate: string | null;
      locationId: string;
      title: string;
      count: number;
    }
  | {
      id: string;
      kind: "event";
      dayId: string;
      dayLabel: string;
      dayDate: string | null;
      event: ScannableEventRow;
      count: number;
    };

const formatDayDate = (date: string | null): string => {
  if (!date) return "Date TBD";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDeviceTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
};

export const QrScanClient = ({
  eventDays,
  events,
  hubHost,
  eventAttendanceCounts,
  locationDayCounts,
  debugEnabled,
  initialEventId,
}: QrScanClientProps) => {
  const [activeTarget, setActiveTarget] = useState<QrScannerTarget | null>(null);
  const timeZone = useMemo(() => getDeviceTimeZone(), []);

  const sections = useMemo(() => {
    const eventsByDay = new Map<string, ScannableEventRow[]>();
    for (const event of events) {
      const list = eventsByDay.get(event.dayId) ?? [];
      list.push(event);
      eventsByDay.set(event.dayId, list);
    }

    const dayIdsWithContent = new Set<string>([
      ...events.map((event) => event.dayId),
      ...(hubHost.isHubHost ? eventDays.map((day) => day.dayId) : []),
    ]);

    const orderedDays = eventDays.filter((day) => dayIdsWithContent.has(day.dayId));

    return orderedDays.map((day) => {
      const cards: ScanCard[] = [];

      if (hubHost.isHubHost) {
        for (const locationId of hubHost.hostedLocationIds) {
          const countKey = `${locationId}:${day.dayId}`;
          cards.push({
            id: `venue-${day.dayId}-${locationId}`,
            kind: "venue",
            dayId: day.dayId,
            dayLabel: day.label,
            dayDate: day.date,
            locationId,
            title: "Scan venue visitors",
            count: locationDayCounts[countKey] ?? 0,
          });
        }
      }

      for (const event of eventsByDay.get(day.dayId) ?? []) {
        cards.push({
          id: `event-${event.id}`,
          kind: "event",
          dayId: day.dayId,
          dayLabel: day.label,
          dayDate: day.date,
          event,
          count: eventAttendanceCounts[event.id] ?? 0,
        });
      }

      const canScanToday =
        debugEnabled || isScanDayToday(day.date, timeZone);

      return {
        day,
        cards,
        canScanToday,
      };
    });
  }, [
    debugEnabled,
    eventAttendanceCounts,
    eventDays,
    events,
    hubHost.hostedLocationIds,
    hubHost.isHubHost,
    locationDayCounts,
    timeZone,
  ]);

  const sortedSections = useMemo(() => {
    const todayFirst = [...sections].sort((a, b) => {
      if (a.canScanToday && !b.canScanToday) return -1;
      if (!a.canScanToday && b.canScanToday) return 1;
      return a.day.dayId.localeCompare(b.day.dayId);
    });
    return todayFirst;
  }, [sections]);

  const enabledCardCount = sortedSections.reduce(
    (total, section) => total + (section.canScanToday ? section.cards.length : 0),
    0,
  );

  useEffect(() => {
    if (!initialEventId || activeTarget) return;

    const matchingCard = sortedSections
      .flatMap((section) => section.cards)
      .find(
        (card): card is Extract<ScanCard, { kind: "event" }> =>
          card.kind === "event" && card.event.id === initialEventId,
      );

    if (!matchingCard) return;

    const section = sortedSections.find((item) =>
      item.cards.some((card) => card.id === matchingCard.id),
    );
    if (!section?.canScanToday && !debugEnabled) return;

    setActiveTarget({
      mode: "event",
      eventId: matchingCard.event.id,
      label: matchingCard.event.title,
    });
  }, [activeTarget, debugEnabled, initialEventId, sortedSections]);

  const handleOpenCard = (card: ScanCard, canScanToday: boolean) => {
    if (!canScanToday && !debugEnabled) return;

    if (card.kind === "venue") {
      setActiveTarget({
        mode: "location-day",
        dayId: card.dayId,
        locationId: card.locationId,
        label: `${card.title} — ${card.dayLabel}`,
      });
      return;
    }

    setActiveTarget({
      mode: "event",
      eventId: card.event.id,
      label: card.event.title,
    });
  };

  return (
    <div className="px-[30px] mini-padding">
      <Dialog
        open={activeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setActiveTarget(null);
        }}
      >
        <DialogContent className="max-w-sm gap-3 p-4 sm:max-w-md">
          <DialogHeader className="space-y-1 pr-8">
            <DialogTitle className="text-base">{activeTarget?.label}</DialogTitle>
          </DialogHeader>
          {activeTarget ? (
            <QrScanner
              key={
                activeTarget.mode === "event"
                  ? `event-${activeTarget.eventId}`
                  : `venue-${activeTarget.dayId}-${activeTarget.locationId}`
              }
              target={activeTarget}
              timeZone={timeZone}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <h1 className="title-text">QR Scan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a scan card to begin.
        </p>
        {debugEnabled && (
          <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Debug mode is active. Scan day checks are bypassed.
          </p>
        )}
      </div>

      {enabledCardCount === 0 ? (
        <div className="border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Nothing to scan today.</p>
        </div>
      ) : null}

      <div className="space-y-8">
        {sortedSections.map((section) => (
          <section key={section.day.dayId} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
              <h2 className="text-base font-semibold">{section.day.label}</h2>
              <span className="text-sm text-muted-foreground">
                {formatDayDate(section.day.date)}
              </span>
              {section.canScanToday ? (
                <Badge variant="default">Today</Badge>
              ) : (
                <Badge variant="secondary">
                  Opens {formatDayDate(section.day.date)}
                </Badge>
              )}
            </div>

            {section.cards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scan targets for this day.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.cards.map((card) => {
                  const isEnabled = section.canScanToday || debugEnabled;
                  const isVenue = card.kind === "venue";

                  return (
                    <Button
                      key={card.id}
                      type="button"
                      variant={isVenue ? "default" : "outline"}
                      disabled={!isEnabled}
                      aria-label={
                        card.kind === "event"
                          ? `Scan check-in for ${card.event.title}`
                          : `Scan venue visitors for ${card.dayLabel}`
                      }
                      className={cn(
                        "h-auto min-h-[120px] w-full flex-col items-start justify-between gap-3 p-4 text-left whitespace-normal",
                        !isEnabled && "opacity-50",
                      )}
                      onClick={() => handleOpenCard(card, section.canScanToday)}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isVenue ? (
                            <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                          ) : (
                            <QrCode className="h-4 w-4 shrink-0" aria-hidden />
                          )}
                          <span className="font-semibold">
                            {card.kind === "event" ? card.event.title : card.title}
                          </span>
                        </div>
                        <Badge variant="secondary">{card.count} checked in</Badge>
                      </div>

                      {card.kind === "event" ? (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{card.event.type}</Badge>
                          <span>
                            {card.event.start_time} – {card.event.end_time}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Count total visitors at your venue for this day.
                        </p>
                      )}

                      {!isEnabled ? (
                        <span className="text-xs text-muted-foreground">
                          Opens {formatDayDate(card.dayDate)}
                        </span>
                      ) : null}
                    </Button>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};
