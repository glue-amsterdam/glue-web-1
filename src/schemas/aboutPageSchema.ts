import { z } from "zod";
import type { HomeCitizensData, HomeStickyGroupData } from "@/lib/home/types";

export const ABOUT_BLOCK_IDS = {
  TEAM: "meet-the-team",
  FOUNDATION: "glue-foundation",
  NEWSLETTER: "newsletter",
  MISSION: "mission-statement",
  PRESS: "press-media",
  ARCHIVE: "archive",
  FAQ: "faq",
} as const;

export const ABOUT_ANCHORS = {
  TEAM: "team",
  FOUNDATION: "glue-foundation",
  MISSION: "mission-statement",
  PRESS: "press-media",
  ARCHIVE: "archive",
  FAQ: "faq",
} as const;

export const aboutNavLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  is_visible: z.boolean(),
});

export const blockMediaSchema = z.object({
  image: z.object({
    src: z.string(),
    alt: z.string(),
  }),
});

export const teamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  description: z.string().optional(),
});

export const teamBlockSchema = z.object({
  id: z.literal(ABOUT_BLOCK_IDS.TEAM),
  title: z.string(),
  description: z.string(),
  is_visible: z.boolean(),
  media: blockMediaSchema,
  members: z.array(teamMemberSchema),
});

export const textDualBlockSchema = z.object({
  id: z.enum([
    ABOUT_BLOCK_IDS.FOUNDATION,
    ABOUT_BLOCK_IDS.MISSION,
    ABOUT_BLOCK_IDS.PRESS,
  ]),
  title: z.string(),
  description: z.string(),
  is_visible: z.boolean(),
  media: blockMediaSchema,
  text_block_1: z.string(),
  text_block_2: z.string(),
});

export const archiveYearMediaSchema = z.object({
  video: z
    .object({
      src: z.string(),
      alt: z.string(),
      poster: z.string(),
    })
    .optional(),
  image: z
    .object({
      src: z.string(),
      alt: z.string(),
    })
    .optional(),
});

export const archiveYearNumberSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const archiveYearSectionSchema = z.object({
  year: z.number(),
  media: archiveYearMediaSchema,
  numbers: z.array(archiveYearNumberSchema),
  text_block: z.object({
    title: z.string(),
    description: z.string(),
  }),
  citizens_of_honour: z.object({
    data: z.custom<HomeCitizensData>().optional(),
  }),
  sticky_members: z.object({
    data: z.custom<HomeStickyGroupData>().optional(),
  }),
});

export const archiveBlockSchema = z.object({
  id: z.literal(ABOUT_BLOCK_IDS.ARCHIVE),
  title: z.string(),
  description: z.string(),
  is_visible: z.boolean(),
  years: z.array(z.number()),
  default_year: z.number().optional(),
  default_section: archiveYearSectionSchema.optional(),
  preloaded_sections: z.array(archiveYearSectionSchema).optional(),
});

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string(),
});

export const faqBlockSchema = z.object({
  id: z.literal(ABOUT_BLOCK_IDS.FAQ),
  title: z.string(),
  description: z.string(),
  is_visible: z.boolean(),
  items: z.array(faqItemSchema),
});

export const newsletterBlockSchema = z.object({
  id: z.literal(ABOUT_BLOCK_IDS.NEWSLETTER),
  is_visible: z.boolean(),
});

export const aboutBlockSchema = z.discriminatedUnion("id", [
  teamBlockSchema,
  textDualBlockSchema,
  newsletterBlockSchema,
  archiveBlockSchema,
  faqBlockSchema,
]);

export const aboutPageSchema = z.object({
  navbar: z.array(aboutNavLinkSchema),
  blocks: z.array(aboutBlockSchema),
});

export type AboutNavLink = z.infer<typeof aboutNavLinkSchema>;
export type BlockMedia = z.infer<typeof blockMediaSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type TeamBlock = z.infer<typeof teamBlockSchema>;
export type TextDualBlock = z.infer<typeof textDualBlockSchema>;
export type ArchiveYearSection = z.infer<typeof archiveYearSectionSchema>;
export type ArchiveBlock = z.infer<typeof archiveBlockSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type FaqBlock = z.infer<typeof faqBlockSchema>;
export type NewsletterBlock = z.infer<typeof newsletterBlockSchema>;
export type AboutBlock = z.infer<typeof aboutBlockSchema>;
export type AboutPageData = z.infer<typeof aboutPageSchema>;
