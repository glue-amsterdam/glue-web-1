interface TimeRange {
  open: string;
  close: string;
}

interface VisitingHours {
  [day: string]: TimeRange[];
}

interface SocialMediaLinks {
  instagram?: string[];
  facebook?: string[];
  linkedin?: string[];
}

export interface Member {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  address: string;
  visitingHours: VisitingHours;
  phoneNumber: string[];
  visibleEmail: string[];
  visibleWebsite: string[];
  socialMedia: SocialMediaLinks;
  images: string[];
}

export interface MembersResponse {
  members: Member[];
}
