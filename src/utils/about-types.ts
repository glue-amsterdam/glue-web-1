import { Member } from "@/utils/member-types";

export interface Image {
  id: string;
  src: string;
  alt: string;
}

export interface CarouselSectionContent {
  title: string;
  description: string;
  slides: Image[];
}

export interface Citizen {
  id: string;
  name: string;
  image: Image;
  description: string;
  year: number;
}

export interface CuratedMember {
  id: number;
  name: string;
  slug: string;
  year: number;
}

export interface InfoItem {
  id: string;
  title: string;
  image: Image;
  description: string;
}

export interface PressItem {
  id: string;
  title: string;
  image: Image;
  description: string;
  content?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: Image;
  website?: string;
  sponsorT: string;
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
  participants: Member[];
}

export interface CuratedMemberSectionContent {
  title: string;
  description: string;
  curatedMembers: CuratedMember[];
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
  sponsors: Sponsor[];
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
}
