"use client";

import { useEffect, useState, useCallback } from "react";
import MainDaysForm from "./MainDaysForm";
import { EventDay } from "@/schemas/eventSchemas";
import MainTextForm, { HomeTextFormValues } from "./MainTextForm";
import { LinkItem, MainColors, MainMenuData } from "@/schemas/mainSchema";
import MainColorsForm from "./MainColorsForm";
import MainMenuForm from "./MainMenuForm";
import MainLinksForm from "./MainLinksForm";
import MainPressKitForm from "./MainPressKitForm";
import AdminHeader from "../AdminHeader";
import AdminBackHeader from "../AdminBackHeader";
import { config } from "@/env";
import { ApiPressKitLinks } from "@/types/api-main-raw";

export default function MainClientPage() {
  const [eventDays, setEventDays] = useState<EventDay[]>([]);
  const [homeText, setHomeText] = useState<HomeTextFormValues | null>(null);
  const [mainColors, setMainColors] = useState<MainColors | null>(null);
  const [mainMenu, setMainMenu] = useState<MainMenuData | null>(null);
  const [mainLinks, setMainLinks] = useState<{ mainLinks: LinkItem[] } | null>(
    null
  );
  const [pressKitLinks, setPressKitLinks] = useState<ApiPressKitLinks | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [dataKey, setDataKey] = useState(0); // Add a key to force re-render when data changes

  const fetchData = async () => {
      try {
        const [
          eventDaysRes,
          homeTextRes,
          mainColorsRes,
          mainMenuRes,
          mainLinksRes,
          pressKitLinksRes,
        ] = await Promise.all([
          fetch(`${config.baseApiUrl}/admin/main/days`),
          fetch(`${config.baseApiUrl}/admin/main/home_text`),
          fetch(`${config.baseApiUrl}/admin/main/colors`),
          fetch(`${config.baseApiUrl}/admin/main/menu`),
          fetch(`${config.baseApiUrl}/admin/main/links`),
          fetch(`${config.baseApiUrl}/admin/main/press_kit_links`),
        ]);

        const [
          eventDaysData,
          homeTextData,
          mainColorsData,
          mainMenuData,
          mainLinksData,
          pressKitLinksData,
        ] = await Promise.all([
          eventDaysRes.json(),
          homeTextRes.json(),
          mainColorsRes.json(),
          mainMenuRes.json(),
          mainLinksRes.json(),
          pressKitLinksRes.json(),
        ]);

        setEventDays(eventDaysData.eventDays || []);
        setHomeText(homeTextData);
        setMainColors(mainColorsData);
        setMainMenu(mainMenuData);
        setMainLinks(mainLinksData);
        setPressKitLinks(pressKitLinksData);
        setDataKey((prev) => prev + 1); // Increment key to force re-render
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEventDaysUpdate = useCallback(() => {
    // Fetch only event days data and update state
    fetch(`${config.baseApiUrl}/admin/main/days`)
      .then((res) => res.json())
      .then((data) => {
        setEventDays(data.eventDays || []);
        setDataKey((prev) => prev + 1);
      })
      .catch((error) => {
        console.error("Error refreshing event days:", error);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <AdminHeader />
          <AdminBackHeader backLink="/admin" sectionTitle="Main" />
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <AdminHeader />
        <AdminBackHeader backLink="/admin" sectionTitle="Main" />
        {eventDays && (
          <MainDaysForm 
            key={`days-${dataKey}`} 
            initialData={{ eventDays }}
            onDataUpdated={handleEventDaysUpdate}
          />
        )}
        {homeText && (
          <MainTextForm key={`text-${dataKey}`} initialData={homeText} />
        )}
        {mainColors && (
          <MainColorsForm key={`colors-${dataKey}`} initialData={mainColors} />
        )}
        {mainMenu && (
          <MainMenuForm key={`menu-${dataKey}`} initialData={mainMenu} />
        )}
        {mainLinks && (
          <MainLinksForm key={`links-${dataKey}`} initialData={mainLinks} />
        )}
        {pressKitLinks && pressKitLinks.pressKitLinks && (
          <MainPressKitForm
            key={`press-kit-${dataKey}`}
            initialData={{ pressKitLinks: pressKitLinks.pressKitLinks }}
          />
        )}
      </div>
    </div>
  );
}
