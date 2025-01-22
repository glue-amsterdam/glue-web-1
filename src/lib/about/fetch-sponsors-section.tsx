import { BASE_URL } from "@/constants";
import {
  SponsorsSection,
  sponsorsSectionSchema,
} from "@/schemas/sponsorsSchema";

const SPONSORS_FALLBACK_DATA: SponsorsSection = {
  sponsorsHeaderSchema: {
    id: "sponsors-section",
    title: "Sponsors",
    is_visible: false,
    description:
      "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
    sponsors_types: [
      { label: "Gold" },
      { label: "Silver" },
      { label: "Bronze" },
    ],
  },
  sponsors: [
    {
      id: "placeholder-1",
      name: "Placeholder 1",
      website: "https://www.placeholder.com",
      sponsor_type: "Gold",
      image_url: "/placeholder.jgp",
    },
    {
      id: "placeholder-2",
      name: "Placeholder 2",
      website: "https://www.placeholder.com",
      sponsor_type: "Silver",
      image_url: "/placeholder.jgp",
    },
    {
      id: "placeholder-3",
      name: "Placeholder 3",
      website: "https://www.placeholder.com",
      sponsor_type: "Bronze",
      image_url: "/placeholder.jgp",
    },
  ],
};

export async function fetchSponsorsData(): Promise<SponsorsSection> {
  try {
    const res = await fetch(`${BASE_URL}/about/sponsors`, {
      next: {
        revalidate: 3600,
        tags: ["sponsors"],
      },
    });

    if (!res.ok) {
      if (
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_PHASE === "phase-production-build"
      ) {
        console.log("Build environment detected, using mock data");
        return getMockData();
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: SponsorsSection = await res.json();
    const validatedData = sponsorsSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching sponsors data:", error);
    return getMockData();
  }
}

export function getMockData(): SponsorsSection {
  return SPONSORS_FALLBACK_DATA;
}
