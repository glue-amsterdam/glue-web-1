"use client";

import { useEffect, useState } from "react";
import {
  LinkItemAdmin,
  MainColorsFormData,
  MainMenuData,
} from "@/schemas/mainSchema";
import { config } from "@/config";
import { ApiPressKitLinks } from "@/types/api-main-raw";
import MainColorsForm from "@/components/admin/main/MainColorsForm";
import MainMenuForm from "@/components/admin/main/MainMenuForm";
import MainLinksForm from "@/components/admin/main/MainLinksForm";
import MainPressKitForm from "@/components/admin/main/MainPressKitForm";

export default function MainClientPage() {
  const [mainColors, setMainColors] = useState<MainColorsFormData | null>(null);
  const [mainMenu, setMainMenu] = useState<MainMenuData | null>(null);
  const [mainLinks, setMainLinks] = useState<{ mainLinks: LinkItemAdmin[] } | null>(
    null
  );
  const [pressKitLinks, setPressKitLinks] = useState<ApiPressKitLinks | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [dataKey, setDataKey] = useState(0);

  const fetchData = async () => {
    try {
      const [mainColorsRes, mainMenuRes, mainLinksRes, pressKitLinksRes] =
        await Promise.all([
          fetch(`${config.baseApiUrl}/admin/main/colors`),
          fetch(`${config.baseApiUrl}/admin/main/menu`),
          fetch(`${config.baseApiUrl}/admin/main/links`),
          fetch(`${config.baseApiUrl}/admin/main/press_kit_links`),
        ]);

      const [mainColorsData, mainMenuData, mainLinksData, pressKitLinksData] =
        await Promise.all([
          mainColorsRes.json(),
          mainMenuRes.json(),
          mainLinksRes.json(),
          pressKitLinksRes.json(),
        ]);

      setMainColors(mainColorsData);
      setMainMenu(mainMenuData);
      setMainLinks(mainLinksData);
      setPressKitLinks(pressKitLinksData);
      setDataKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching admin data:", error);
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
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[15px] lg:gap-[30px]">
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
  );
}
