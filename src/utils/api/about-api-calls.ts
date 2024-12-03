import { BASE_URL } from "@/constants";
import { CarouselClientType } from "@/schemas/baseSchema";
import { carouselSectionSchema } from "@/schemas/carouselSchema";
import {
  ClientCitizensSection,
  clientCitizensSectionSchema,
} from "@/schemas/citizenSchema";
import {
  CuratedResponse,
  curatedResponseSchema,
} from "@/schemas/curatedSchema";
import {
  InfoSectionClient,
  infoSectionClientSchema,
} from "@/schemas/infoSchema";
import {
  ParticipantsResponse,
  participantsResponseSchema,
} from "@/schemas/participantsSchema";

export async function fetchUserCarousel(): Promise<CarouselClientType> {
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

    return carouselSectionSchema.parse(data);
  } catch (error) {
    console.error("Error fetching carousel data:", error);
    throw error;
  }
}
export async function fetchAboutParticipants(): Promise<ParticipantsResponse> {
  try {
    const res = await fetch(`${BASE_URL}/about/participants`, {
      next: {
        revalidate: 3600,
        tags: ["participants"],
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch participants: ${res.statusText}`);
    }
    const data = await res.json();

    return participantsResponseSchema.parse(data);
  } catch (error) {
    console.error("Error fetching participants data:", error);
    throw error;
  }
}
export async function fetchInfoSection(): Promise<InfoSectionClient> {
  try {
    const res = await fetch(`${BASE_URL}/about/info`, {
      next: {
        revalidate: 3600, // 1 hour
        tags: ["info"],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch info section data: ${res.statusText}`);
    }
    const data = await res.json();
    return infoSectionClientSchema.parse(data);
  } catch (error) {
    console.error("Error fetching info section data:", error);
    throw error;
  }
}
export async function fetchUserCurated(): Promise<CuratedResponse> {
  try {
    const res = await fetch(`${BASE_URL}/about/curated`, {
      next: {
        revalidate: 3600,
        tags: ["about-curated"],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch about curated data: ${res.statusText}`);
    }

    const data = await res.json();

    return curatedResponseSchema.parse(data);
  } catch (error) {
    console.error("Error fetching curated data:", error);
    throw error;
  }
}
export async function fetchCitizensOfHonor(): Promise<ClientCitizensSection> {
  try {
    const response = await fetch(`${BASE_URL}/about/citizens`, {
      next: {
        revalidate: 3600,
        tags: ["citizens"],
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch citizens data: ${response.statusText}`);
    }

    const data = await response.json();
    return clientCitizensSectionSchema.parse(data);
  } catch (error) {
    console.error("Error fetching citizens data:", error);
    throw error;
  }
}
