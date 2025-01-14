import { BASE_URL } from "@/constants";
import {
  GlueInternationalContent,
  glueInternationalSectionSchema,
} from "@/schemas/internationalSchema";

const INTERNATIONAL_FALLBACK_DATA: GlueInternationalContent = {
  title: "GLUE International",
  subtitle: "GLUE arround the world",
  button_text: "Visit GLUE International",
  website: "http://glue-international.com",
  button_color: "#10069F",
};

export async function fetchInternationalContent(): Promise<GlueInternationalContent> {
  try {
    const res = await fetch(`${BASE_URL}/about/international`, {
      next: {
        revalidate: 3600,
        tags: ["international"],
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
    const validatedData = glueInternationalSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching citizens data:", error);
    return getMockData();
  }
}

export function getMockData(): GlueInternationalContent {
  return INTERNATIONAL_FALLBACK_DATA;
}
