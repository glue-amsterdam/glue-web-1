"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainSectionForm from "./forms/main-section-form";
import AboutSectionForm from "./forms/about-section-form";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">Admin Panel</h2>
      <Tabs defaultValue="main-section" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="main-section" className="text-lg">
            Main Section
          </TabsTrigger>
          <TabsTrigger value="about-section" className="text-lg">
            About Section
          </TabsTrigger>
        </TabsList>
        <TabsContent value="main-section">
          <MainSectionForm />
        </TabsContent>
        <TabsContent value="about-section">
          <AboutSectionForm />
        </TabsContent>
      </Tabs>
      <div className="mt-8 flex justify-between">
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
