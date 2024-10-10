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

export interface Participant {
  id: number;
  name: string;
  image: string;
  website: string;
  description: string;
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
}

export interface Sponsor {
  id: number;
  name: string;
  logo: string;
  website: string;
}

export interface GlueInternationalContent {
  title: string;
  buttonText: string;
  website: string;
}

export interface DatabaseContent {
  mainSection: MainSectionContent;
  participants: Participant[];
  citizens: Citizen[];
  curatedMembers: CuratedMember[];
  infoItems: InfoItem[];
  pressItems: PressItem[];
  sponsors: Sponsor[];
  glueInternational: {
    title: string;
    buttonText: string;
    website: string;
  };
}
