import { BASE_URL } from "@/constants";
import {
  CuratedResponse,
  curatedResponseSchema,
} from "@/schemas/curatedSchema";

const CURATED_FALLBACK_DATA: CuratedResponse = {
  headerData: {
    title: "GLUE STICKY MEMBER",
    description:
      "Discover the GLUE STICKY MEMBER, a curated group of designers, architects, and creatives who have made a significant impact on the industry.",
    is_visible: false,
  },
  curatedParticipants: {
    "2024": [
      {
        slug: "placeholder-1",
        userName: "Loading Member 1",
        year: 2024,
        image: {
          image_url: "/participant-placeholder.jpg",
          alt: "Loading Member 1 profile image - participant from GLUE design routes",
        },
      },
      {
        slug: "placeholder-2",
        userName: "Loading Member 2",
        year: 2024,
        image: {
          image_url: "/participant-placeholder.jpg",
          alt: "Loading Member 2 profile image - participant from GLUE design routes",
        },
      },
    ],
  },
};

export async function fetchCuratedSection(): Promise<CuratedResponse> {
  try {
    const res = await fetch(`${BASE_URL}/about/curated`, {
      next: {
        revalidate: 3600,
        tags: ["curated-section"],
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

    const data = await res.json();
    console.log("Raw API response:", JSON.stringify(data, null, 2));

    const validatedData = curatedResponseSchema.parse(data);

    console.log("After validation:", JSON.stringify(validatedData, null, 2));

    return validatedData;
  } catch (error) {
    console.error("Error fetching curated section data:", error);
    return getMockData();
  }
}

export function getMockData(): CuratedResponse {
  return CURATED_FALLBACK_DATA;
}
