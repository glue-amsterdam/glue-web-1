import { cache } from "react";
import {
  MainSectionContent,
  Participant,
  Citizen,
  CuratedMember,
  InfoItem,
  PressItem,
  Sponsor,
  GlueInternationalContent,
} from "@/utils/about-types";
import { MainMenu } from "./menu-types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const fetchMainMenu = cache(async (): Promise<MainMenu[]> => {
  const res = await fetch(`${BASE_URL}/main/main-menu`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch mainMenu");
  return res.json();
});

export const fetchMainSectionContent = cache(
  async (): Promise<MainSectionContent> => {
    const res = await fetch(`${BASE_URL}/about/main-section`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch main section content");
    return res.json();
  }
);

export const fetchParticipants = cache(async (): Promise<Participant[]> => {
  const res = await fetch(`${BASE_URL}/about/participants`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch participants");
  return res.json();
});

export const fetchCitizensData = cache(
  async (): Promise<{ citizens: Citizen[]; years: number[] }> => {
    const res = await fetch(`${BASE_URL}/about/citizens`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch citizens data");
    return res.json();
  }
);

export const fetchCuratedMembers = cache(async (): Promise<CuratedMember[]> => {
  const res = await fetch(`${BASE_URL}/about/curated-members`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch curated members");
  return res.json();
});

export const fetchInfoItems = cache(async (): Promise<InfoItem[]> => {
  const res = await fetch(`${BASE_URL}/about/info-items`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch info items");
  return res.json();
});

export const fetchPressItems = cache(async (): Promise<PressItem[]> => {
  const res = await fetch(`${BASE_URL}/about/press-items`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch press items");
  return res.json();
});

export const fetchSponsors = cache(async (): Promise<Sponsor[]> => {
  const res = await fetch(`${BASE_URL}/about/sponsors`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch sponsors");
  return res.json();
});

export const fetchGlueInternationalContent = cache(
  async (): Promise<GlueInternationalContent> => {
    const res = await fetch(`${BASE_URL}/about/glue-international`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch GLUE International content");
    return res.json();
  }
);
