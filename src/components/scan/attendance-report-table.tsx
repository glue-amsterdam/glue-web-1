"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadAttendanceReportCsv } from "@/lib/scan/download-attendance-report-csv";
import type {
  AttendanceReportRow,
  AttendanceReportSummary,
} from "@/lib/scan/get-attendance-report-data";

type AttendanceReportTableProps = {
  rows: AttendanceReportRow[];
  summary: AttendanceReportSummary;
  reportName: string;
  emptyMessage?: string;
};

type BucketSize = "15" | "30" | "60" | "120";

const bucketOptions: Array<{ value: BucketSize; label: string; description: string }> = [
  { value: "15", label: "15 min", description: "15 min blocks" },
  { value: "30", label: "30 min", description: "30 min blocks" },
  { value: "60", label: "1 hour", description: "1 hour blocks" },
  { value: "120", label: "2 hours", description: "2 hour blocks" },
];

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getTargetLabel = (row: AttendanceReportRow): string => {
  if (row.scope === "event") {
    return row.eventTitle ?? "Unknown event";
  }

  return [row.locationName, row.dayLabel].filter(Boolean).join(" - ") || "Unknown venue";
};

const hourlyChartConfig = {
  checkIns: {
    label: "Check-ins",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const formatBucketTime = (totalMinutes: number): string => {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const getBucketLabel = (bucketStartMinutes: number, bucketSizeMinutes: number) => {
  const bucketEndMinutes = bucketStartMinutes + bucketSizeMinutes - 1;
  return `${formatBucketTime(bucketStartMinutes)}-${formatBucketTime(bucketEndMinutes)}`;
};

const getBucketedScanData = (
  rows: AttendanceReportRow[],
  bucketSize: BucketSize,
) => {
  const bucketSizeMinutes = Number(bucketSize);
  const countsByBucket = new Map<number, number>();

  for (const row of rows) {
    const date = new Date(row.scannedAt);
    if (Number.isNaN(date.getTime())) continue;

    const minutesSinceMidnight = date.getHours() * 60 + date.getMinutes();
    const bucketStartMinutes =
      Math.floor(minutesSinceMidnight / bucketSizeMinutes) * bucketSizeMinutes;
    countsByBucket.set(
      bucketStartMinutes,
      (countsByBucket.get(bucketStartMinutes) ?? 0) + 1,
    );
  }

  return [...countsByBucket.entries()]
    .sort(([firstBucket], [secondBucket]) => firstBucket - secondBucket)
    .map(([bucketStartMinutes, checkIns]) => ({
      timeBlock: getBucketLabel(bucketStartMinutes, bucketSizeMinutes),
      checkIns,
    }));
};

export const AttendanceReportTable = ({
  rows,
  summary,
  reportName,
  emptyMessage = "No attendance rows found for this report.",
}: AttendanceReportTableProps) => {
  const [bucketSize, setBucketSize] = useState<BucketSize>("30");
  const hasRows = rows.length > 0;
  const bucketedScanData = useMemo(
    () => getBucketedScanData(rows, bucketSize),
    [bucketSize, rows],
  );
  const selectedBucketOption =
    bucketOptions.find((option) => option.value === bucketSize) ?? bucketOptions[1];
  const summaryItems = [
    { label: "Check-ins", value: summary.totalCheckIns },
    { label: "Unique visitors", value: summary.uniqueVisitors },
    { label: "Events", value: summary.eventCount },
    { label: "Venue days", value: summary.locationDayCount },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-sm font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!hasRows}
          onClick={() => downloadAttendanceReportCsv(rows, reportName)}
        >
          Download
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Generated {formatDateTime(summary.generatedAt)}
      </p>

      {!hasRows ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Scans by time block</h3>
                  <p className="text-xs text-muted-foreground">
                    Check-ins grouped by {selectedBucketOption.description}.
                  </p>
                </div>
                <Select
                  value={bucketSize}
                  onValueChange={(value) => setBucketSize(value as BucketSize)}
                >
                  <SelectTrigger
                    className="h-8 w-[120px]"
                    aria-label="Select chart time grouping"
                  >
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    {bucketOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ChartContainer config={hourlyChartConfig} className="h-[220px] w-full">
                <BarChart data={bucketedScanData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="timeBlock"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar
                    dataKey="checkIns"
                    fill="var(--color-checkIns)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="max-h-[360px] overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Scanned at</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.visitorName}</TableCell>
                    <TableCell>
                      <Badge variant={row.scope === "event" ? "default" : "secondary"}>
                        {row.scope === "event" ? "Event" : "Venue day"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getTargetLabel(row)}</TableCell>
                    <TableCell>{formatDateTime(row.scannedAt)}</TableCell>
                    <TableCell>{row.areaName || "No area"}</TableCell>
                    <TableCell>{row.email || "No email"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};
