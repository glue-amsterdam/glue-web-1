"use client";

import { useMemo, useState } from "react";
import { AttendanceReportTable } from "@/components/scan/attendance-report-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type {
  AttendanceReportData,
  AttendanceReportOptions,
  AttendanceReportRow,
  AttendanceReportScopeFilter,
  AttendanceReportSummary,
} from "@/lib/scan/get-attendance-report-data";

type ReportClientProps = {
  options: AttendanceReportOptions;
};

const allValue = "all";

const buildSummary = (rows: AttendanceReportRow[]): AttendanceReportSummary => ({
  totalCheckIns: rows.length,
  uniqueVisitors: new Set(rows.map((row) => row.visitorId)).size,
  eventCount: new Set(
    rows
      .filter((row) => row.scope === "event")
      .map((row) => row.eventId)
      .filter(Boolean),
  ).size,
  locationDayCount: new Set(
    rows
      .filter((row) => row.scope === "location-day")
      .map((row) => `${row.locationId ?? ""}:${row.dayId ?? ""}`),
  ).size,
  generatedAt: new Date().toISOString(),
});

const getRowSearchText = (row: AttendanceReportRow): string =>
  [
    row.visitorName,
    row.email,
    row.areaName,
    row.eventTitle,
    row.eventType,
    row.dayLabel,
    row.locationName,
    row.locationAddress,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const ReportClient = ({ options }: ReportClientProps) => {
  const { toast } = useToast();
  const [scope, setScope] = useState<AttendanceReportScopeFilter>("all");
  const [eventId, setEventId] = useState(allValue);
  const [dayId, setDayId] = useState(allValue);
  const [locationId, setLocationId] = useState(allValue);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<AttendanceReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredRows = useMemo(() => {
    if (!reportData) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return reportData.rows;

    return reportData.rows.filter((row) => getRowSearchText(row).includes(term));
  }, [reportData, searchTerm]);

  const filteredSummary = useMemo(
    () => (reportData ? buildSummary(filteredRows) : null),
    [filteredRows, reportData],
  );

  const reportName = useMemo(() => {
    const parts = ["attendance-report", scope];
    if (eventId !== allValue) parts.push(eventId);
    if (dayId !== allValue) parts.push(dayId);
    if (locationId !== allValue) parts.push(locationId);
    return parts.join("-");
  }, [dayId, eventId, locationId, scope]);

  const handleLoadReport = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({ scope });
      if (eventId !== allValue) params.set("eventId", eventId);
      if (dayId !== allValue) params.set("dayId", dayId);
      if (locationId !== allValue) params.set("locationId", locationId);

      const response = await fetch(`/api/dashboard/report?${params.toString()}`);
      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(errorBody?.error ?? "Failed to load report.");
      }

      const data = (await response.json()) as AttendanceReportData;
      setReportData(data);
      setSearchTerm("");
    } catch (error) {
      console.error("Error loading dashboard report:", error);
      toast({
        title: "Could not load report",
        description:
          error instanceof Error
            ? error.message
            : "Please try loading the report again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-[30px] mini-padding pb-8">
      <div className="mb-6">
        <h1 className="title-text">Report</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Load QR attendance data on demand, filter it in your browser, and download CSV.
        </p>
      </div>

      <Card className="mb-5">
        <CardContent className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="report-scope">Report type</Label>
            <Select
              value={scope}
              onValueChange={(value) => {
                const nextScope = value as AttendanceReportScopeFilter;
                setScope(nextScope);
                if (nextScope !== "event") setEventId(allValue);
                if (nextScope === "event") setLocationId(allValue);
              }}
            >
              <SelectTrigger id="report-scope" aria-label="Report type">
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All attendance</SelectItem>
                <SelectItem value="event">Events attendance</SelectItem>
                <SelectItem value="location-day">Location-day attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-day">Day</Label>
            <Select value={dayId} onValueChange={setDayId}>
              <SelectTrigger id="report-day" aria-label="Day filter">
                <SelectValue placeholder="All days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allValue}>All days</SelectItem>
                {options.days.map((day) => (
                  <SelectItem key={day.id} value={day.id}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-event">Event</Label>
            <Select
              value={eventId}
              onValueChange={(value) => {
                setEventId(value);
                if (value !== allValue) {
                  setScope("event");
                  setLocationId(allValue);
                }
              }}
              disabled={scope === "location-day"}
            >
              <SelectTrigger id="report-event" aria-label="Event filter">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allValue}>All events</SelectItem>
                {options.events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-location">Location</Label>
            <Select
              value={locationId}
              onValueChange={(value) => {
                setLocationId(value);
                if (value !== allValue && scope === "event") {
                  setScope("all");
                }
              }}
              disabled={scope === "event"}
            >
              <SelectTrigger id="report-location" aria-label="Location filter">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allValue}>All locations</SelectItem>
                {options.locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={handleLoadReport}
            >
              {isLoading ? "Loading..." : "Load report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData ? (
        <div className="space-y-4">
          <div className="max-w-md">
            <Label htmlFor="report-search">Search loaded rows</Label>
            <Input
              id="report-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search visitor, event, email, location..."
              className="mt-2"
            />
          </div>

          {filteredSummary ? (
            <AttendanceReportTable
              rows={filteredRows}
              summary={filteredSummary}
              reportName={reportName}
              emptyMessage="No rows match the current search."
            />
          ) : null}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Choose filters and load a report to view attendance rows.
          </p>
        </div>
      )}
    </div>
  );
};
