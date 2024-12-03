import { BASE_URL } from "@/constants";
import { MainColors, mainColorsSchema } from "@/schemas/mainSchema";
import { cache } from "react";

const COLORS_FALLBACK_DATA: MainColors = {
  box1: "#10069f",
  box2: "#230052",
  box3: "#000000",
  box4: "#db8861",
  triangle: "#ffa16c",
};

export const fetchColors = cache(async (): Promise<MainColors> => {
  try {
    const res = await fetch(`${BASE_URL}/admin/main/colors`, {
      next: { revalidate: 3600, tags: ["main-colors"] },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NEXT_PHASE === "build") {
        console.warn("Using fallback data for main colors during build");
        return COLORS_FALLBACK_DATA;
      }
      throw new Error(
        `Failed to fetch main colors during build": ${res.statusText}`
      );
    }

    const data = await res.json();
    return mainColorsSchema.parse(data);
  } catch (error) {
    console.error("Error fetching main colors:", error);
    throw error;
  }
});
