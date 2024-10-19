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

export interface DatabaseContent {
  mainSection: MainSectionContent;
  participants: Member[];
  citizens: Citizen[];
  curatedMembers: CuratedMember[];
  infoItems: InfoItem[];
  pressItems: PressItem[];
  sponsors: Sponsor[];
  glueInternational: GlueInternationalContent;
}
