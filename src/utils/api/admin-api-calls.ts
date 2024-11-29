import { BASE_URL } from "@/constants";
import { MainColors, MainSection } from "@/utils/menu-types";
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

export const fetchMainSection = cache(async (): Promise<MainSection> => {
  const res = await fetch(`${BASE_URL}/admin/main/menu`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Admin main section");
  }
  return res.json();
});
