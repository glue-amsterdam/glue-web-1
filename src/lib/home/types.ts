import type { ClientCitizen } from "@/schemas/citizenSchema";

export const HOME_STICKY_CACHE_TAG = "home-sticky";
export const HOME_CITIZENS_CACHE_TAG = "home-citizens";
export const HOME_VIDEO_CACHE_TAG = "home-video";

export type HomeStickyParticipant = {
  userId: string;
  slug: string | null;
  userName: string;
  image: { image_url: string; alt: string };
};

export type HomeStickyGroupData = {
  title: string;
  description: string;
  year: number | null;
  group_photo_url: string | null;
  additional_members_text: string;
  participants: HomeStickyParticipant[];
};

export type HomeCitizensData = {
  title: string;
  description: string;
  year: string;
  citizens: ClientCitizen[];
};

export const HOME_HERO_REVALIDATE_SECONDS = 2_592_000;

export type HomeHeroData = {
  id: string | null;
  description: string;
  videoUrl: string;
  posterUrl: string;
};

/** @deprecated Use HomeHeroData */
export type HomeVideoData = HomeHeroData;
