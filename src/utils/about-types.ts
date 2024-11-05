import { ImageData } from "@/schemas/baseSchema";

export interface CarouselSectionContent {
  title: string;
  description: string;
  slides: ImageData[];
}

export interface Citizen {
  id: string;
  name: string;
  image: ImageData;
  description: string;
  year: number;
}

export interface InfoItem {
  id: string;
  title: string;
  image: ImageData;
  description: string;
}

export interface PressItem {
  id: string;
  title: string;
  image: ImageData;
  description: string;
  content?: string;
}

export interface GlueInternationalContent {
  title: string;
  buttonText: string;
  website: string;
  subtitle: string;
  buttonColor: string;
}

export interface ParticipantsSectionContent {
  title: string;
  description: string;
}

export interface CuratedMemberSectionContent {
  title: string;
  description: string;
}

export interface CitizensSectionContent {
  title: string;
  description: string;
  citizens: Citizen[];
}

export interface InfoSectionContent {
  title: string;
  description: string;
  infoItems: InfoItem[];
}

export interface PressItemsSectionContent {
  title: string;
  description: string;
  pressItems: PressItem[];
}

export interface SponsorsSectionContent {
  title: string;
  description: string;
}

export interface DatabaseContent {
  carouselSection: CarouselSectionContent;
  participantsSection: ParticipantsSectionContent;
  citizensSection: CitizensSectionContent;
  curatedMembersSection: CuratedMemberSectionContent;
  infoItemsSection: InfoSectionContent;
  pressItemsSection: PressItemsSectionContent;
  sponsorsSection: SponsorsSectionContent;
  glueInternationalSection: GlueInternationalContent;
  createdAt: Date;
  updatedAt: Date;
}
