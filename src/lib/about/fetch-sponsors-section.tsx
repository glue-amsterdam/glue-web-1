import { BASE_URL } from "@/constants";
import {
  SponsorsSection,
  sponsorsSectionSchema,
} from "@/schemas/sponsorsSchema";

const SPONSORS_FALLBACK_DATA: SponsorsSection = {
  sponsorsHeaderSchema: {
    id: "sponsors-section",
    title: "Sponsors",
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
      alt: "Placeholder 1",
    },
    {
      id: "placeholder-2",
      name: "Placeholder 2",
      website: "https://www.placeholder.com",
      sponsor_type: "Silver",
      image_url: "/placeholder.jgp",
      alt: "Placeholder 2",
    },
    {
      id: "placeholder-3",
      name: "Placeholder 3",
      website: "https://www.placeholder.com",
      sponsor_type: "Bronze",
      image_url: "/placeholder.jgp",
      alt: "Placeholder 3",
    },
  ],
};

export async function fetchAboutParticipants(): Promise<SponsorsSection> {
  try {
    const res = await fetch(`${BASE_URL}/about/sponsors`, {
      next: {
        revalidate: 3600,
        tags: ["sponsors"],
      },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NODE_ENV === "development") {
        console.warn("Using fallback data for sponsors section");
        return SPONSORS_FALLBACK_DATA;
      }
      throw new Error(
        `Failed to fetch sponsors section data: ${res.statusText}`
      );
    }

    const data = await res.json();
    const validatedData = sponsorsSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching sponsors data:", error);
    return SPONSORS_FALLBACK_DATA;
  }
}
