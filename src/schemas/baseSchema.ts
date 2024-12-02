import { CarouselSection } from "@/schemas/carouselSchema";
import { CitizensSection } from "@/schemas/citizenSchema";
import { CuratedMemberSectionHeader } from "@/schemas/curatedSchema";
import { InfoSection } from "@/schemas/infoSchema";
import { ParticipantsSectionHeader } from "@/schemas/participantsAdminSchema";
import {
  CuratedParticipantWhitYear,
  ParticipantUser,
} from "@/schemas/usersSchemas";
import * as z from "zod";

export const imageDataSchema = z.object({
  id: z.string(),
  image_name: z.string().optional(),
  image_url: z.string(),
  alt: z.string().min(1, "Alt text is required"),
  file: z.any().optional(),
  oldImageUrl: z.string().optional(),
});

export type ImageData = z.infer<typeof imageDataSchema>;

/* ABOUT SECTION ADMIN FORM SCHEMAS => */

export type PressItemsSectionContent = z.infer<typeof pressItemsSectionSchema>;
export type SponsorsSectionContent = z.infer<typeof sponsorsSectionSchema>;
export type GlueInternationalContent = z.infer<
  typeof glueInternationalSectionSchema
>;

export type PressItem = z.infer<typeof pressItemSchema>;

export type CarouselClientType = {
  title: string;
  description: string;
  slides: Array<{
    image_url: string;
    alt: string;
  }>;
};
export type AboutParticipantsClientType = {
  headerData: ParticipantsSectionHeader;
  participants: ParticipantUser[];
};

export type AboutCuratedClientType = {
  headerData: CuratedMemberSectionHeader;
  curatedParticipants: Record<number, CuratedParticipantWhitYear[]>;
};

export const pressItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  image: imageDataSchema,
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .optional(),
});

export const pressItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pressItems: z
    .array(pressItemSchema)
    .min(1, "At least 1 press item is required")
    .max(2, "Maximum 2 press items allowed"),
});

export const glueInternationalButtonColorSchema = z.object({
  buttonColor: z
    .string()
    .min(1, "Button color is required")
    .regex(
      /^#(?:[0-9a-fA-F]{3}){1,2}$/,
      "Button color must be a valid hex code"
    ),
});

export const glueInternationalSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  buttonText: z.string().min(1, "Button text is required"),
  website: z.string().url("Invalid website URL"),
  buttonColor: glueInternationalButtonColorSchema,
});

export const sponsorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Invalid website URL"),
  sponsorT: z.string().min(1, "Sponsor type is required"),
  logo: imageDataSchema,
});

export const sponsorsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
/* <= ABOUT SECTION ADMIN FORM SCHEMAS */

/* API CALLS TYPES => */

export type DatabaseAboutContent = {
  carouselSection: CarouselSection;
  participantsSection: ParticipantsSectionHeader;
  citizensSection: CitizensSection;
  curatedMembersSection: CuratedMemberSectionHeader;
  infoItemsSection: InfoSection;
  pressItemsSection: PressItemsSectionContent;
  sponsorsSection: SponsorsSectionContent;
  glueInternationalSection: GlueInternationalContent;
  createdAt: Date;
  updatedAt: Date;
};

/* <= API CALLS TYPES */
