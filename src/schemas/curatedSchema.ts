import { CuratedParticipantWhitYear } from "@/schemas/usersSchemas";
import { z } from "zod";

export const curatedMembersSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type CuratedMemberSectionHeader = z.infer<
  typeof curatedMembersSectionSchema
>;

export const curatedParticipantSchema = z.object({
  slug: z.string(),
  userName: z.string(),
  year: z.number(),
});

export const curatedHeaderSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const curatedResponseSchema = z.object({
  headerData: curatedHeaderSchema,
  curatedParticipants: z.record(z.array(curatedParticipantSchema)),
});

export type CuratedParticipant = z.infer<typeof curatedParticipantSchema>;
export type CuratedHeader = z.infer<typeof curatedHeaderSchema>;
export type CuratedResponse = z.infer<typeof curatedResponseSchema>;
export type AboutCuratedClientType = {
  headerData: CuratedMemberSectionHeader;
  curatedParticipants: Record<string, CuratedParticipantWhitYear[]>;
};
