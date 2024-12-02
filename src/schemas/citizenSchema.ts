import { imageDataSchema } from "@/schemas/baseSchema";
import { z } from "zod";

export const citizenSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  image: imageDataSchema,
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const citizensByYearSchema = z.record(
  z.string(),
  z.array(citizenSchema)
);

export const citizensSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  citizensByYear: citizensByYearSchema,
});

export type Citizen = z.infer<typeof citizenSchema>;
export type CitizensByYear = z.infer<typeof citizensByYearSchema>;
export type CitizensSection = z.infer<typeof citizensSectionSchema>;
