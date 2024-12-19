import { z } from "zod";

export const participantImageSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  user_id: z.string().uuid(),
  image_url: z.string().url(),
});

export type ParticipantImage = z.infer<typeof participantImageSchema>;

export const participantImageCreateSchema = participantImageSchema.omit({
  id: true,
  created_at: true,
});

export type ParticipantImageCreate = z.infer<
  typeof participantImageCreateSchema
>;

// New form schema that doesn't rely on FileList
export const formSchema = z.object({
  image: z.any(), // We'll validate this manually in the component
});

export type FormData = z.infer<typeof formSchema>;
