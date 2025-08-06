import { ParticipantsSectionHeader } from "@/schemas/participantsAdminSchema";
import { ParticipantUser } from "@/schemas/usersSchemas";
import { z } from "zod";

export const participantHeaderSchema = z.object({
  title: z.string(),
  description: z.string(),
  is_visible: z.boolean(),
  text_color: z.string(),
  background_color: z.string(),
});

export const participantClientSchema = z.object({
  slug: z.string(),
  userName: z.string(),
  short_description: z.string(),
  image: z.object({
    image_url: z.string(),
  }),
});

export const participantsResponseSchema = z.object({
  headerData: participantHeaderSchema,
  participants: z.array(participantClientSchema),
});

export type ParticipantHeader = z.infer<typeof participantHeaderSchema>;
export type ParticipantClient = z.infer<typeof participantClientSchema>;
export type ParticipantsResponse = z.infer<typeof participantsResponseSchema>;
export type AboutParticipantsClientType = {
  headerData: ParticipantsSectionHeader;
  participants: ParticipantUser[];
};
