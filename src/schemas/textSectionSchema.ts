import { z } from "zod";

export const TEXT_SECTION_SLUGS = [
  "become-an-exhibitor",
  "alternatives-unexpected",
  "newsletter",
  "visit-intro",
  "visit-sign-up",
  "visit-discover",
  "participate-intro",
  "participate-how-it-works",
  "participate-select-plan",
] as const;

export type TextSectionSlug = (typeof TEXT_SECTION_SLUGS)[number];

export const TEXT_SECTION_ADMIN_GROUPS = ["home", "visit", "participate"] as const;

export type TextSectionAdminGroup = (typeof TEXT_SECTION_ADMIN_GROUPS)[number];

export const TEXT_SECTION_VARIANTS = ["block", "intro"] as const;

export type TextSectionVariant = (typeof TEXT_SECTION_VARIANTS)[number];

const textSectionBaseSchema = z.object({
  slug: z.enum(TEXT_SECTION_SLUGS),
  admin_group: z.enum(TEXT_SECTION_ADMIN_GROUPS),
  variant: z.enum(TEXT_SECTION_VARIANTS),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  show_button: z.boolean(),
  button_label: z.string().nullable(),
  button_link: z.string().nullable(),
  section_id: z.string().min(1, "Section id is required"),
});

export const textSectionSchema = textSectionBaseSchema.superRefine((data, ctx) => {
  if (data.show_button) {
    if (!data.button_label?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Button label is required when button is shown",
        path: ["button_label"],
      });
    }
    if (!data.button_link?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Button link is required when button is shown",
        path: ["button_link"],
      });
    }
  }
});

export type TextSection = z.infer<typeof textSectionSchema>;

export const textSectionUpdateSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    show_button: z.boolean(),
    button_label: z.string().nullable().optional(),
    button_link: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.show_button) {
      if (!data.button_label?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Button label is required when button is shown",
          path: ["button_label"],
        });
      }
      if (!data.button_link?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Button link is required when button is shown",
          path: ["button_link"],
        });
      }
    }
  });

export type TextSectionUpdate = z.infer<typeof textSectionUpdateSchema>;

export const isTextSectionSlug = (value: string): value is TextSectionSlug =>
  TEXT_SECTION_SLUGS.includes(value as TextSectionSlug);

export const isTextSectionAdminGroup = (
  value: string
): value is TextSectionAdminGroup =>
  TEXT_SECTION_ADMIN_GROUPS.includes(value as TextSectionAdminGroup);
