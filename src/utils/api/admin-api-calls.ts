import { BASE_URL } from "@/constants";
import { MainLinks } from "@/schemas/baseSchema";
import { MainColors, MainMenuItem } from "@/utils/menu-types";
import { cache } from "react";

export const fetchColors = cache(async (): Promise<MainColors> => {
  const res = await fetch(`${BASE_URL}/admin/main/colors`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Admin main colors");
  }
  return res.json();
});

export const fetchMainSection = cache(async (): Promise<MainMenuItem[]> => {
  const res = await fetch(`${BASE_URL}/admin/main/menu`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Admin main section");
  }
  return res.json();
});
export const fetchMainLinks = cache(async (): Promise<MainLinks> => {
  const res = await fetch(`${BASE_URL}/admin/main/links`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Admin link section");
  }
  return res.json();
});
