import type { ClientCitizen } from "@/schemas/citizenSchema";

export const HOME_STICKY_CACHE_TAG = "home-sticky";
export const HOME_CITIZENS_CACHE_TAG = "home-citizens";
export const HOME_VIDEO_CACHE_TAG = "home-video";

export type HomeStickyParticipant = {
  userId: string;
  slug: string;
  userName: string;
  image: { image_url: string; alt: string };
};

export type HomeStickyGroupData = {
  title: string;
  description: string;
  is_visible: boolean;
  year: number | null;
  group_photo_url: string | null;
  participants: HomeStickyParticipant[];
};

export type HomeCitizensData = {
  title: string;
  description: string;
  is_visible: boolean;
  year: string;
  citizens: ClientCitizen[];
};

export type HomeVideoData = {
  videoUrl: string;
  posterUrl: string;
};
