import { z } from "zod";

export const participantsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_visible: z.boolean(),
  text_color: z.string().min(1, "Text color is required"),
  background_color: z.string().min(1, "Background color is required"),
});

export type ParticipantsSectionHeader = z.infer<
  typeof participantsSectionSchema
>;
