import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

function AdminDashboardTabsList() {
  return (
    <TabsList className="h-full  w-full flex flex-wrap justify-center items-center text-white gap-2">
      <TabsTrigger
        value="main-section"
        className="text-sm lg:text-lg hover:scale-105 transition-all bg-[var(--color-box1)]"
      >
        Main Section
      </TabsTrigger>
      <TabsTrigger
        value="about-section"
        className="text-sm lg:text-lg hover:scale-105 transition-all bg-[var(--color-box1)]"
      >
        About Section
      </TabsTrigger>
      <TabsTrigger
        value="plans-section"
        className="text-sm lg:text-lg hover:scale-105 transition-all bg-[var(--color-box1)]"
      >
        Plans Section
      </TabsTrigger>
    </TabsList>
  );
}

export default AdminDashboardTabsList;
