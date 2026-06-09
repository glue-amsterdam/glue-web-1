"use client";

import { useCallback, useEffect, useState } from "react";
import MainDaysForm from "@/components/admin/main/MainDaysForm";
import TourManagementForm from "@/components/admin/main/TourManagementForm";
import { config } from "@/config";
import { EventDay } from "@/schemas/eventSchemas";

export default function TourManagementPage() {
  const [eventDays, setEventDays] = useState<EventDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataKey, setDataKey] = useState(0);

  const fetchEventDays = useCallback(async () => {
    try {
      const response = await fetch(`${config.baseApiUrl}/admin/main/days`);
      const data = await response.json();
      setEventDays(data.eventDays || []);
      setDataKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching event days:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventDays();
  }, [fetchEventDays]);

  const handleEventDaysUpdate = useCallback(() => {
    void fetchEventDays();
  }, [fetchEventDays]);

  const handleTourStatusChanged = () => {
    setDataKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      <MainDaysForm
        key={`days-${dataKey}`}
        initialData={{ eventDays }}
        onDataUpdated={handleEventDaysUpdate}
      />
      <TourManagementForm
        key={`tour-${dataKey}`}
        onTourStatusChanged={handleTourStatusChanged}
      />
    </div>
  );
}
