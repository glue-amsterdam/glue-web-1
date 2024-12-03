import { BASE_URL } from "@/constants";
import {
  ClientCitizen,
  ClientCitizensSection,
  clientCitizensSectionSchema,
} from "@/schemas/citizenSchema";

const FALLBACK_CITIZEN: ClientCitizen = {
  id: "placeholder",
  name: "Loading...",
  image_url: "/placeholder.jpg",
  alt: "Loading placeholder",
  description: "Loading description...",
  year: "2024",
};

const CITIZENS_FALLBACK_DATA: ClientCitizensSection = {
  title: "Creative Citizens of Honour",
  description: "Loading citizens of honor information...",
  citizensByYear: {
    "2024": Array(3).fill(FALLBACK_CITIZEN),
  },
};
export async function fetchCitizensOfHonor(): Promise<ClientCitizensSection> {
  if (process.env.NEXT_PHASE === "build") {
    console.warn("Using fallback data for citizens during build");
    return CITIZENS_FALLBACK_DATA;
  }

  try {
    const response = await fetch(`${BASE_URL}/about/citizens`, {
      next: {
        revalidate: 3600,
        tags: ["citizens"],
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch citizens data: ${response.statusText}`);
    }

    const data = await response.json();
    return clientCitizensSectionSchema.parse(data);
  } catch (error) {
    console.error("Error fetching citizens data:", error);
    return CITIZENS_FALLBACK_DATA;
  }
}
