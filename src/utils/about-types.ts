import { Member } from "@/utils/member-types";

export interface SlideImage {
  id: number;
  src: string;
  alt: string;
}

export interface MainSectionContent {
  title: string;
  description: string;
  slides: SlideImage[];
}

export interface Citizen {
  id: number;
  name: string;
  image: string;
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
  id: number;
  title: string;
  image: string;
  description: string;
}

export interface PressItem {
  id: number;
  title: string;
  image: string;
  description: string;
  content?: string;
}

export interface Sponsor {
  id: number;
  name: string;
  logo: string;
  website?: string;
  sponsorT: string;
}

export interface GlueInternationalContent {
  title: string;
  buttonText: string;
  website: string;
  subtitle: string;
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
  mainSection: MainSectionContent;
  participantsSection: ParticipantsSectionContent;
  citizensSection: CitizensSectionContent;
  curatedMembersSection: CuratedMemberSectionContent;
  infoItemsSection: InfoSectionContent;
  pressItemsSection: PressItemsSectionContent;
  sponsorsSection: SponsorsSectionContent;
  glueInternationalSection: GlueInternationalContent;
}
