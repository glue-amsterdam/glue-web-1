import { BASE_URL } from "@/constants";
import {
  InfoSectionClient,
  infoSectionClientSchema,
} from "@/schemas/infoSchema";

const INFO_FALLBACK_DATA: InfoSectionClient = {
  title: "Information about GLUE",
  description:
    "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
  infoItems: [
    {
      id: "mission-statement",
      title: "Mission Statement",
      description:
        "<p>GLUE aspires to diversity and inclusivity, with a focus on sustainability and wellbeing.</p>",
      image: {
        image_url: "/placeholder.jpg",
      },
    },
    {
      id: "meet-the-team",
      title: "Meet the Team",
      description:
        "<p>Our dedicated team works tirelessly to connect and promote the Amsterdam design community.</p>",
      image: {
        image_url: "/placeholder.jpg",
      },
    },
    {
      id: "glue-foundation",
      title: "GLUE Foundation",
      description:
        "<p>The GLUE Foundation is responsible for cultural programs and initiatives within the GLUE community.</p>",
      image: {
        image_url: "/placeholder.jpg",
      },
    },
  ],
};
export async function fetchInfoSection(): Promise<InfoSectionClient> {
  try {
    const res = await fetch(`${BASE_URL}/about/info`, {
      next: {
        revalidate: 3600,
        tags: ["info-section"],
      },
    });

    if (!res.ok) {
      console.error(
        `Error fetching info section: ${res.status} ${res.statusText}`
      );
      if (res.status === 404 || process.env.NODE_ENV === "development") {
        console.warn("Using fallback data for info section");
        return INFO_FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch info section data: ${res.statusText}`);
    }

    const data = await res.json();
    const validatedData = infoSectionClientSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error in fetchInfoSection:", error);
    return INFO_FALLBACK_DATA;
  }
}
