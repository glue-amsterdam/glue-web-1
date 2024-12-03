import { BASE_URL } from "@/constants";
import { MainLinks, mainLinksSchema } from "@/schemas/mainSchema";
import { cache } from "react";

const MAIN_LINKS_FALLBACK_DATA: MainLinks = [
  {
    platform: "newsletter",
    link: "https://amsterdam.us5.list-manage.com/subscribe?u=b588bd4354fa4df94fbd3803c&id=9cda67fd4c",
  },
  {
    platform: "linkedin",
    link: "https://www.linkedin.com/company/glue-amsterdam-connected-by-design/",
  },
  {
    platform: "instagram",
    link: "https://www.instagram.com/",
  },
  {
    platform: "youtube",
    link: "https://www.youtube.com/@GLUETV_amsterdam",
  },
];

export const fetchMainLinks = cache(async (): Promise<MainLinks> => {
  try {
    const res = await fetch(`${BASE_URL}/admin/main/links`, {
      next: { revalidate: 3600, tags: ["main-links"] },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NEXT_PHASE === "build") {
        console.warn("Using fallback data for main colors during build");
        return MAIN_LINKS_FALLBACK_DATA;
      }
      throw new Error(
        `Failed to fetch main colors during build": ${res.statusText}`
      );
    }

    const data = await res.json();
    return mainLinksSchema.parse(data);
  } catch (error) {
    console.error("Error fetching main colors:", error);
    throw error;
  }
});
