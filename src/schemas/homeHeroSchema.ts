import { z } from "zod";

export const homeHeroSchema = z.object({
  id: z.string().uuid().optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description must be less than 255 characters"),
  video_url: z.string().url("Desktop video URL is required"),
  video_url_mobile: z.union([z.string().url(), z.literal("")]),
  poster_url: z.string().url("Poster URL is required"),
});

export type HomeHero = z.infer<typeof homeHeroSchema>;
