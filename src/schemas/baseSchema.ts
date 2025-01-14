import { CarouselSection } from "@/schemas/carouselSchema";
import { CitizensSection } from "@/schemas/citizenSchema";
import { CuratedMemberSectionHeader } from "@/schemas/curatedSchema";
import { InfoSection } from "@/schemas/infoSchema";
import { GlueInternationalContent } from "@/schemas/internationalSchema";
import { ParticipantsSectionHeader } from "@/schemas/participantsAdminSchema";
import { PressItemsSectionContent } from "@/schemas/pressSchema";
import { SponsorsSection } from "@/schemas/sponsorsSchema";
import * as z from "zod";

export const imageDataSchema = z.object({
  image_name: z.string().optional(),
  image_url: z.string(),
  file: z.any().optional(),
  oldImageUrl: z.string().optional(),
});
export type ImageData = z.infer<typeof imageDataSchema>;

export type DatabaseAboutContent = {
  carouselSection: CarouselSection;
  participantsSection: ParticipantsSectionHeader;
  citizensSection: CitizensSection;
  curatedMembersSection: CuratedMemberSectionHeader;
  infoItemsSection: InfoSection;
  pressItemsSection: PressItemsSectionContent;
  sponsorsSection: SponsorsSection;
  glueInternationalSection: GlueInternationalContent;
  createdAt: Date;
  updatedAt: Date;
};
