import { BASE_URL } from "@/constants";
import { CarouselClientType } from "@/schemas/baseSchema";

const CAROUSEL_FALLBACK_DATA: CarouselClientType = {
  title: "Welcome to GLUE",
  description: "Discover Amsterdam's vibrant design community",
  slides: [
    {
      image_url: "/placeholder.jgp",
      alt: "GLUE Amsterdam Design Community",
    },
    {
      image_url: "/placeholder.jgp",
      alt: "GLUE Events and Activities",
    },
    {
      image_url: "/placeholder.jgp",
      alt: "GLUE Community Members",
    },
  ],
};

export async function fetchUserCarousel(): Promise<CarouselClientType> {
  if (process.env.NEXT_PHASE === "build") {
    console.warn("Using fallback data for carousel during build");
    return CAROUSEL_FALLBACK_DATA;
  }

  try {
    const res = await fetch(`${BASE_URL}/about/carousel`, {
      next: {
        revalidate: 3600,
        tags: ["about-carousel"],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch carousel data: ${res.statusText}`);
    }

    const data = await res.json();

    if ("error" in data) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Error fetching carousel data:", error);
    return CAROUSEL_FALLBACK_DATA;
  }
}