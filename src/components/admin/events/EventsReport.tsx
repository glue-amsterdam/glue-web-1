"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileSpreadsheet } from "lucide-react";
import ExcelJS from "exceljs";
import type { SelectableField } from "./EventsClientPage";
import { EVENT_TYPES } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EventReportData {
  id: string;
  title: string;
  description: string;
  type: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  location: string;
  coOrganizers: string;
  rsvp: string;
  rsvpMessage: string;
  rsvpLink: string;
  createdAt: string;
  tourStatus: string;
}

interface EventsReportProps {
  onClose?: () => void;
  selectedFields?: SelectableField[];
  filterType?: string;
  filterDay?: string;
  availableDays?: { dayId: string; label: string }[];
}

const FIELD_LABELS: Record<SelectableField, string> = {
  id: "Event ID",
  title: "Title",
  description: "Description",
  type: "Type",
  day: "Day",
  date: "Date",
  startTime: "Start Time",
  endTime: "End Time",
  organizer: "Organizer",
  location: "Location",
  coOrganizers: "Co-Organizers",
  rsvp: "RSVP",
  createdAt: "Created At",
};

export default function EventsReport({
  onClose,
  selectedFields = [
    "title",
    "type",
    "day",
    "date",
    "startTime",
    "endTime",
    "organizer",
    "location",
    "rsvp",
  ],
  filterType = "all",
  filterDay = "all",
  availableDays = [],
}: EventsReportProps) {
  const [allEvents, setAllEvents] = useState<EventReportData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [currentFilterType, setCurrentFilterType] = useState(filterType);
  const [currentFilterDay, setCurrentFilterDay] = useState(filterDay);

  // Helper function to get event field value
  const getEventValue = (event: EventReportData, field: SelectableField): string => {
    switch (field) {
      case "id":
        return event.id;
      case "title":
        return event.title;
      case "description":
        return event.description || "";
      case "type":
        return event.type;
      case "day":
        return event.day;
      case "date":
        return event.date;
      case "startTime":
        return event.startTime;
      case "endTime":
        return event.endTime;
      case "organizer":
        return event.organizer;
      case "location":
        return event.location;
      case "coOrganizers":
        return event.coOrganizers;
      case "rsvp":
        return event.rsvp;
      case "createdAt":
        return event.createdAt;
      default:
        return "";
    }
  };

  const [days, setDays] = useState<{ dayId: string; label: string }[]>(
    availableDays || []
  );

  // Fetch events
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch("/api/admin/events/report");
        if (!response.ok) {
          throw new Error("Failed to fetch events report");
        }
        const data = await response.json();
        setAllEvents(data.events || []);
        if (data.availableDays && data.availableDays.length > 0) {
          setDays(data.availableDays);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Apply filters whenever events or filter values change
  useEffect(() => {
    let filtered = [...allEvents];

    // Filter by type
    if (currentFilterType !== "all") {
      filtered = filtered.filter((event) => event.type === currentFilterType);
    }

    // Filter by day
    if (currentFilterDay !== "all") {
      filtered = filtered.filter((event) => event.day === currentFilterDay);
    }

    setFilteredEvents(filtered);
  }, [allEvents, currentFilterType, currentFilterDay]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    try {
      // Create a new workbook and worksheet using ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Events Report");

      // Prepare headers
      const headers = selectedFields.map((field) => FIELD_LABELS[field]);
      
      // Add header row with styling
      const headerRow = worksheet.addRow(headers);
      
      // Style header row with light blue background
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFADD8E6" }, // Light blue (RGB: 173, 216, 230)
        };
        cell.font = {
          bold: true,
          color: { argb: "FF000000" }, // Black text
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      });

      // Add data rows
      filteredEvents.forEach((event) => {
        const rowData = selectedFields.map((field) => getEventValue(event, field));
        worksheet.addRow(rowData);
      });

      // Auto-size columns
      worksheet.columns.forEach((column) => {
        if (column.header) {
          column.width = Math.max(column.header.length + 2, 15);
        }
      });

      // Generate Excel file
      const fileName = `GLUE_Events_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
      
      // Write file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Events Report</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Events Report</h2>
        </div>
        <div className="text-red-500 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-xl font-semibold">Events Report</h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleExportExcel} className="flex items-center gap-2" variant="outline">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-2" variant="outline">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-type">Filter by Type</Label>
            <Select value={currentFilterType} onValueChange={setCurrentFilterType}>
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-day">Filter by Day</Label>
            <Select value={currentFilterDay} onValueChange={setCurrentFilterDay}>
              <SelectTrigger id="filter-day">
                <SelectValue placeholder="All Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {days.map((day) => (
                  <SelectItem key={day.dayId} value={day.label}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none">
        <div className="mb-4 print:mb-2">
          <h3 className="text-2xl font-bold print:text-xl">GLUE Events Report</h3>
          <p className="text-gray-600 print:text-sm">
            Generated on: {new Date().toLocaleString()}
          </p>
          <p className="text-gray-600 print:text-sm">
            Total Events: {filteredEvents.length}
            {filteredEvents.length !== allEvents.length && (
              <span className="text-gray-500">
                {" "}
                (filtered from {allEvents.length} total)
              </span>
            )}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 print:text-xs">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                {selectedFields.map((field) => (
                  <th key={field} className="border border-gray-300 p-2 text-left">
                    {FIELD_LABELS[field]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={selectedFields.length}
                    className="border border-gray-300 p-4 text-center"
                  >
                    No events found matching the selected filters
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 print:hover:bg-transparent"
                  >
                    {selectedFields.map((field) => (
                      <td
                        key={field}
                        className={`border border-gray-300 p-2 ${
                          field === "title" ? "font-medium" : ""
                        }`}
                      >
                        {getEventValue(event, field)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:text-xs {
            font-size: 0.75rem !important;
          }
          .print\\:text-sm {
            font-size: 0.875rem !important;
          }
          .print\\:text-xl {
            font-size: 1.25rem !important;
          }
          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }
          .print\\:mt-4 {
            margin-top: 1rem !important;
          }
          .print\\:py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          .print\\:bg-gray-200 {
            background-color: #e5e7eb !important;
          }
          .print\\:hover\\:bg-transparent:hover {
            background-color: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
