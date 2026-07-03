import { z } from "zod";

const hexColorSchema = z
  .string()
  .regex(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/, "Invalid hex color format");

/** Fields shown in the admin form */
export const participantCategoryUserFormSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1, "Label is required"),
  bgColor: hexColorSchema,
  fontColor: hexColorSchema,
  sortOrder: z.number().int().nonnegative(),
});

export type ParticipantCategoryUserFormData = z.infer<
  typeof participantCategoryUserFormSchema
>;

export const slugifyParticipantCategoryLabel = (label: string): string =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
