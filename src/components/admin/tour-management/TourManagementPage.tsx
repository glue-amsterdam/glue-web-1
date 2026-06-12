"use client";

import { useRouter } from "next/navigation";
import MainDaysForm from "@/components/admin/main/MainDaysForm";
import TourManagementForm from "@/components/admin/main/TourManagementForm";
import { EventDay } from "@/schemas/eventSchemas";

type TourManagementPageProps = {
  initialEventDays: EventDay[];
};

export default function TourManagementPage({
  initialEventDays,
}: TourManagementPageProps) {
  const router = useRouter();

  const handleEventDaysUpdate = () => {
    router.refresh();
  };

  const handleTourStatusChanged = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      <MainDaysForm
        initialData={{ eventDays: initialEventDays }}
        onDataUpdated={handleEventDaysUpdate}
      />
      <TourManagementForm onTourStatusChanged={handleTourStatusChanged} />
    </div>
  );
}
