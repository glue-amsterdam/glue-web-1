import { z } from "zod";

export const curatedMembersSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type CuratedMemberSectionHeader = z.infer<
  typeof curatedMembersSectionSchema
>;
