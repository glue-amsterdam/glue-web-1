import * as z from "zod";

export const imageDataSchema: z.ZodType<ImageData> = z.object({
  id: z.string(),
  imageName: z.string(),
  imageUrl: z.string(),
  alt: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface ImageData {
  id: string;
  imageName: string;
  imageUrl: string;
  alt?: string;
  createdAt: Date;
  updatedAt: Date;
}
