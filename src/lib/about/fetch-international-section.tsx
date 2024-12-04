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
        tags: ["citizens"],
      },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NODE_ENV === "development") {
        console.warn("Using fallback data for carousel section");
        return INTERNATIONAL_FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch carousel data: ${res.statusText}`);
    }

    const data = await res.json();
    const validatedData = glueInternationalSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching citizens data:", error);
    return INTERNATIONAL_FALLBACK_DATA;
  }
}
