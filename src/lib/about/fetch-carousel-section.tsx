import { BASE_URL } from "@/constants";
import { CarouselClientType } from "@/schemas/baseSchema";
import { carouselSectionSchema } from "@/schemas/carouselSchema";

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
