"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import AdminDashboardTabsList from "@/app/admin/components/admin-dashboard-tabs-list";
import AdminDashboardTabsContent from "@/app/admin/components/admin-dashboard-tabs-content";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">Admin Panel</h2>
      <Tabs defaultValue="main-section" className="space-y-4">
        <AdminDashboardTabsList />
        <AdminDashboardTabsContent />
      </Tabs>
      <div className="mt-8">
        <Button
          type="button"
          className="bg-red-500 hover:bg-red-600"
          onClick={() => setIsLoggedIn(false)}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
