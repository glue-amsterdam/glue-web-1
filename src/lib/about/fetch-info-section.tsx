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
        alt: "GLUE Mission Statement",
      },
    },
    {
      id: "meet-the-team",
      title: "Meet the Team",
      description:
        "<p>Our dedicated team works tirelessly to connect and promote the Amsterdam design community.</p>",
      image: {
        image_url: "/placeholder.jpg",
        alt: "GLUE Team",
      },
    },
    {
      id: "glue-foundation",
      title: "GLUE Foundation",
      description:
        "<p>The GLUE Foundation is responsible for cultural programs and initiatives within the GLUE community.</p>",
      image: {
        image_url: "/placeholder.jpg",
        alt: "GLUE Foundation",
      },
    },
  ],
};

export async function fetchInfoSection(): Promise<InfoSectionClient> {
  if (process.env.NEXT_PHASE === "build") {
    console.warn("Using fallback data for info section during build");
    return INFO_FALLBACK_DATA;
  }

  try {
    const res = await fetch(`${BASE_URL}/about/info`, {
      next: {
        revalidate: 3600,
        tags: ["info-section"],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch info section data: ${res.statusText}`);
    }

    const data = await res.json();
    return infoSectionClientSchema.parse(data);
  } catch (error) {
    console.error("Error fetching info section data:", error);
    return INFO_FALLBACK_DATA;
  }
}
