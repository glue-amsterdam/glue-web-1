import { BASE_URL } from "@/constants";
import { CarouselClientType } from "@/schemas/baseSchema";
import { cache } from "react";

export const fetchUserCarousel = cache(
  async (): Promise<CarouselClientType> => {
    const res = await fetch(`${BASE_URL}/about/carousel`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("Failed to fetch about carousel:");
      throw new Error(`Failed to fetch about carousel`);
    }

    return res.json();
  }
);
