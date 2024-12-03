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
  },
  curatedParticipants: {
    "2024": [
      {
        slug: "placeholder-1",
        userName: "Loading Member 1",
        year: 2024,
      },
      {
        slug: "placeholder-2",
        userName: "Loading Member 2",
        year: 2024,
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
      if (res.status === 404 || process.env.NODE_ENV === "development") {
        console.warn("Using fallback data for curated section");
        return CURATED_FALLBACK_DATA;
      }
      throw new Error(
        `Failed to fetch curated section data: ${res.statusText}`
      );
    }

    const data = await res.json();
    const validatedData = curatedResponseSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching curated section data:", error);
    if (process.env.NEXT_PHASE === "build") {
      console.warn("Using fallback data for curated section due to error");
      return CURATED_FALLBACK_DATA;
    }
    throw error;
  }
}
