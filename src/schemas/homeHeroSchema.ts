import { z } from "zod";

export const homeHeroSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(1, "Description is required"),
  video_url: z.string().url("Video URL is required"),
  poster_url: z.string().url("Poster URL is required"),
});

export type HomeHero = z.infer<typeof homeHeroSchema>;
