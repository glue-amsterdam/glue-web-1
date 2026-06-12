import { z } from "zod";

export const yearlySectionHeaderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export type YearlySectionHeader = z.infer<typeof yearlySectionHeaderSchema>;
