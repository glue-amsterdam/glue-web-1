"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainSectionForm from "./forms/main-section-form";
import AboutSectionForm from "./forms/about-section-form";

import { MainSection } from "@/utils/menu-types";
import { DatabaseContent } from "@/utils/about-types";
import { mainSection } from "@/lib/mockMain";
import { mockAbout } from "@/lib/mockAbout";

interface AdminFormData {
  mainSection: MainSection;
  aboutSection: DatabaseContent;
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // For demo purposes, assume logged in

  const methods = useForm<AdminFormData>({
    defaultValues: {
      mainSection: mainSection,
      aboutSection: mockAbout,
    },
  });

  const onSubmit = (data: AdminFormData) => {
    console.log(data);
    alert("All data updated successfully!");
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mt-8 bg-white rounded-lg shadow-lg p-6"
      >
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">
          Admin Dashboard
        </h2>
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
          <Button type="submit" className="bg-green-500 hover:bg-green-600">
            Save All Changes
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => setIsLoggedIn(false)}
          >
            Log Out
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
