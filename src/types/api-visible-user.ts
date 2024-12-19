export interface ParticipantClientResponse {
  user_id: string;
  slug: string;
  short_description: string;
  description: string | null;
  is_sticky: boolean;
  year: number | null;
  status: string;
  user_info: UserInfo;
  images: ClientUserImage[];
  plan: Plan;
}

interface UserInfo {
  is_mod: boolean;
  plan_id: string;
  plan_type: string;
  user_name: string;
  social_media: SocialMedia;
  phone_numbers: string[] | null;
  visible_emails: string[] | null;
  visible_websites: string[] | null;
  map_info: MapInfo[];
  visiting_hours: VisitingHours[];
  events: Event[];
}

interface SocialMedia {
  facebookLink?: string;
  linkedinLink?: string;
  instagramLink?: string;
}

interface MapInfo {
  formatted_address: string;
  id: string;
  no_address: boolean;
}

interface VisitingHours {
  hours: {
    [key: string]: OpenCloseTime[];
  };
}

interface OpenCloseTime {
  open: string;
  close: string;
}

interface Event {
  id: string;
  image_url: string;
  title: string;
}

export interface ClientUserImage {
  image_url: string;
}

interface Plan {
  plan_label: string;
}
