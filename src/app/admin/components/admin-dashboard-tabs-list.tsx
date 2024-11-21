import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

function AdminDashboardTabsList() {
  return (
    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
      <TabsTrigger value="main-section" className="text-sm lg:text-lg">
        Main Section
      </TabsTrigger>
      <TabsTrigger value="about-section" className="text-sm lg:text-lg">
        About Section
      </TabsTrigger>
      <TabsTrigger value="plans-section" className="text-sm lg:text-lg">
        Plans Section
      </TabsTrigger>
    </TabsList>
  );
}

export default AdminDashboardTabsList;
