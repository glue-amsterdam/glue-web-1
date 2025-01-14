import { BASE_URL } from "@/constants";
import {
  Citizen,
  ClientCitizen,
  ClientCitizensSection,
  clientCitizensSectionSchema,
} from "@/schemas/citizenSchema";

const FALLBACK_CITIZEN: ClientCitizen = {
  id: "placeholder",
  name: "Loading...",
  image_url: "/placeholder.jpg",
  description: "Loading description...",
  year: "2024",
};

const CITIZENS_FALLBACK_DATA: ClientCitizensSection = {
  title: "Creative Citizens of Honour",
  description: "Loading citizens of honor information...",
  citizensByYear: {
    "2024": Array(3).fill(FALLBACK_CITIZEN),
  },
};
export async function fetchCitizensOfHonor(): Promise<ClientCitizensSection> {
  try {
    const res = await fetch(`${BASE_URL}/about/citizens`, {
      next: {
        revalidate: 3600,
        tags: ["citizens"],
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

    const data: ClientCitizensSection = await res.json();
    const validatedData = clientCitizensSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(
      "Error fetching citizens data on fetchCitizensOfHonor:",
      error
    );
    return getMockData();
  }
}

export function getMockData(): ClientCitizensSection {
  return CITIZENS_FALLBACK_DATA;
}

const caches = new Map<string, Promise<Citizen[]>>();

export function fetchCitizensByYear(year: string): Promise<Citizen[]> {
  const cacheKey = `year_${year}`;
  if (!caches.get(cacheKey)) {
    const promise = fetch(`${BASE_URL}/admin/about/citizens/${year}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch citizens for year ${year}`);
        }
        return response.json();
      })
      .then((data) => data.citizens);

    caches.set(year, promise);
  }

  return caches.get(year)!;
}

export async function fetchYears(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/admin/about/citizens/years`);
  if (!response.ok) {
    throw new Error(`Failed to fetch citizens for years`);
  }
  return response.json();
}
