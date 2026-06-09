"use client";

import { useEffect, useState } from "react";
import EventsHeaderTitleForm, {
  EventsHeaderTitleFormValues,
} from "./EventsHeaderTitleForm";
import EventsReport from "./EventsReport";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type SelectableField =
  | "id"
  | "title"
  | "description"
  | "type"
  | "day"
  | "date"
  | "startTime"
  | "endTime"
  | "organizer"
  | "location"
  | "coOrganizers"
  | "rsvp"
  | "createdAt";

const AVAILABLE_FIELDS: { key: SelectableField; label: string }[] = [
  { key: "id", label: "Event ID" },
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "type", label: "Type" },
  { key: "day", label: "Day" },
  { key: "date", label: "Date" },
  { key: "startTime", label: "Start Time" },
  { key: "endTime", label: "End Time" },
  { key: "organizer", label: "Organizer" },
  { key: "location", label: "Location" },
  { key: "coOrganizers", label: "Co-Organizers" },
  { key: "rsvp", label: "RSVP" },
  { key: "createdAt", label: "Created At" },
];

export default function EventsClientPage() {
  const [headerTitle, setHeaderTitle] =
    useState<EventsHeaderTitleFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [selectedFields, setSelectedFields] = useState<SelectableField[]>([
    "title",
    "type",
    "day",
    "date",
    "startTime",
    "endTime",
    "organizer",
    "location",
    "rsvp",
  ]);
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  const fetchData = async () => {
    try {
      const headerTitleRes = await fetch("/api/admin/events/header-title");
      if (!headerTitleRes.ok) {
        throw new Error("Failed to fetch events header title");
      }

      const headerTitleData = await headerTitleRes.json();

      setHeaderTitle({
        header_title: headerTitleData.header_title || "Events",
      });
    } catch (error) {
      console.error("Error fetching events admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      {headerTitle && <EventsHeaderTitleForm initialData={headerTitle} />}
      <div className="border-t pt-4">
        <Button
          onClick={() => {
            if (!showReport) {
              setShowFieldSelector(true);
            } else {
              setShowReport(false);
              setShowFieldSelector(false);
            }
          }}
          className="flex items-center gap-2"
          variant="outline"
        >
          <FileText className="h-4 w-4" />
          {showReport ? "Hide" : "Show"} Events Report
        </Button>
      </div>
      {showFieldSelector && !showReport && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <h2 className="title-text mb-3">Select Fields to Display</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {AVAILABLE_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFields([...selectedFields, field.key]);
                      } else {
                        setSelectedFields(
                          selectedFields.filter((f) => f !== field.key)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={field.key}
                    className="base-text-size cursor-pointer font-normal"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (selectedFields.length > 0) {
                  setShowReport(true);
                  setShowFieldSelector(false);
                } else {
                  alert("Please select at least one field to display.");
                }
              }}
              variant="default"
            >
              Generate Report
            </Button>
            <Button
              onClick={() => {
                setShowFieldSelector(false);
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {showReport && (
        <div className="border-t pt-4">
          <EventsReport
            onClose={() => {
              setShowReport(false);
              setShowFieldSelector(false);
            }}
            selectedFields={selectedFields}
          />
        </div>
      )}
    </div>
  );
}
