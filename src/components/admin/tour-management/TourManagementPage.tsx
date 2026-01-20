"use client";

import { useState } from "react";
import TourManagementForm from "@/components/admin/main/TourManagementForm";
import AdminHeader from "../AdminHeader";
import AdminBackHeader from "../AdminBackHeader";

export default function TourManagementPage() {
  const [dataKey, setDataKey] = useState(0);

  const handleTourStatusChanged = () => {
    // Increment key to force refresh if needed
    setDataKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <AdminHeader />
        <AdminBackHeader backLink="/admin" sectionTitle="Tour Management" />
        <TourManagementForm
          key={`tour-${dataKey}`}
          onTourStatusChanged={handleTourStatusChanged}
        />
      </div>
    </div>
  );
}
