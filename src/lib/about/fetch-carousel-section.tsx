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
      if (
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_PHASE === "phase-production-build"
      ) {
        console.log("Build environment detected, using mock data");
        return getMockData();
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: CarouselClientType = await res.json();
    const validatedData = carouselSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching carousel data:", error);
    return getMockData();
  }
}

export function getMockData(): CarouselClientType {
  return CAROUSEL_FALLBACK_DATA;
}
