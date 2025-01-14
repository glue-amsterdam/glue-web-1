import { BASE_URL } from "@/constants";
import { config } from "@/env";
import {
  CarouselClientType,
  carouselSectionSchema,
} from "@/schemas/carouselSchema";

const CAROUSEL_FALLBACK_DATA: CarouselClientType = {
  title: "Welcome to GLUE",
  description: `Discover ${config.cityName}'s vibrant design community`,
  slides: [
    {
      image_url: "/placeholder.jgp",
    },
    {
      image_url: "/placeholder.jgp",
    },
    {
      image_url: "/placeholder.jgp",
    },
  ],
};

export async function fetchUserCarousel(): Promise<CarouselClientType> {
  try {
    const res = await fetch(`${BASE_URL}/about/carousel`, {
      next: {
        revalidate: 3600,
        tags: ["carousel"],
      },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NODE_ENV === "development") {
        console.warn("Using fallback data for carousel section");
        return CAROUSEL_FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch carousel data: ${res.statusText}`);
    }

    const data = await res.json();
    const validatedData = carouselSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching carousel data:", error);
    return CAROUSEL_FALLBACK_DATA;
  }
}
