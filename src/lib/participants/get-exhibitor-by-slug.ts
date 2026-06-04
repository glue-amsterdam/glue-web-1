import type { OpenCloseTime } from "@/types/api-visible-user";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExhibitorType } from "./exhibitor-types";
import {
  ExhibitorNotFoundError,
  type ExhibitorContactInfo,
  type ExhibitorParticipantDetail,
  type ExhibitorSocialMedia,
} from "./exhibitor-detail-types";
import {
  getTourStatus,
  isParticipantPubliclyVisible,
  isParticipantSticky,
} from "./exhibitor-visibility";
import { participantImagesToCarouselSlides } from "./exhibitor-carousel-slides";
import { toBaseFormattedAddress } from "@/lib/map/to-base-formatted-address";
import { getParticipantPlaceholderUrl } from "./get-participant-placeholder-url";

type UserInfoRow = {
  user_name: string | null;
  phone_numbers: string[] | null;
  social_media: ExhibitorSocialMedia | Record<string, string> | null;
  visible_emails: string[] | null;
  visible_websites: string[] | null;
};

type ParticipantRow = {
  user_id: string;
  slug: string;
  special_program: boolean;
  display_number: string | null;
  short_description: string | null;
  description: string | null;
  status: string;
  is_active: boolean;
  was_active_last_year: boolean;
  user_info: UserInfoRow | UserInfoRow[];
};

const getUserName = (userInfo: UserInfoRow | UserInfoRow[]): string => {
  const info = Array.isArray(userInfo) ? userInfo[0] : userInfo;
  return info?.user_name ?? "Unknown User";
};

const getParticipantType = (specialProgram: boolean): ExhibitorType => {
  return specialProgram ? "special-program" : "up-to-three-participants";
};

const normalizeSocialMedia = (
  socialMedia: UserInfoRow["social_media"]
): ExhibitorSocialMedia | null => {
  if (!socialMedia || typeof socialMedia !== "object") {
    return null;
  }

  const media = socialMedia as ExhibitorSocialMedia;
  if (
    !media.instagramLink &&
    !media.facebookLink &&
    !media.linkedinLink
  ) {
    return null;
  }

  return media;
};

const buildContactInfo = async (
  supabase: SupabaseClient,
  userId: string,
  userInfo: UserInfoRow
): Promise<ExhibitorContactInfo> => {
  const [mapInfoResult, visitingHoursResult, eventsResult] = await Promise.all([
    supabase
      .from("map_info")
      .select("formatted_address, id, no_address")
      .eq("user_id", userId),
    supabase
      .from("visiting_hours")
      .select("day_id, hours")
      .eq("user_id", userId),
    supabase
      .from("events")
      .select("id, image_url, title")
      .eq("organizer_id", userId),
  ]);

  const visitingHours =
    visitingHoursResult.data?.reduce(
      (acc, day) => {
        acc[day.day_id] = day.hours as OpenCloseTime[];
        return acc;
      },
      {} as Record<string, OpenCloseTime[]>
    ) ?? null;

  const hasVisitingHours =
    visitingHours !== null && Object.keys(visitingHours).length > 0;

  const mapInfo = (mapInfoResult.data ?? []).map((map) => ({
    ...map,
    formatted_address: toBaseFormattedAddress(map.formatted_address),
  }));

  return {
    mapInfo,
    phoneNumbers: userInfo.phone_numbers,
    visibleEmails: userInfo.visible_emails,
    visibleWebsites: userInfo.visible_websites,
    socialMedia: normalizeSocialMedia(userInfo.social_media),
    visitingHours: hasVisitingHours ? visitingHours : null,
    events: eventsResult.data ?? [],
  };
};

export const getExhibitorBySlug = async (
  supabase: SupabaseClient,
  slug: string
): Promise<ExhibitorParticipantDetail> => {
  const { data, error } = await supabase
    .from("participant_details")
    .select(
      `
        user_id,
        slug,
        special_program,
        display_number,
        short_description,
        description,
        status,
        is_active,
        was_active_last_year,
        user_info!inner (
          user_name,
          phone_numbers,
          social_media,
          visible_emails,
          visible_websites
        )
      `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new ExhibitorNotFoundError();
    }
    throw error;
  }

  if (!data?.user_id) {
    throw new ExhibitorNotFoundError();
  }

  const row = data as ParticipantRow;
  const isSticky = await isParticipantSticky(supabase, row.user_id);

  if (row.status === "accepted" && !isSticky) {
    const tourStatus = await getTourStatus(supabase);
    if (!isParticipantPubliclyVisible(row, tourStatus)) {
      throw new ExhibitorNotFoundError();
    }
  }

  const placeholderUrl = getParticipantPlaceholderUrl(supabase);
  const participantName = getUserName(row.user_info);
  const { data: imageData } = await supabase
    .from("participant_image")
    .select("id, image_url")
    .eq("user_id", row.user_id)
    .order("id", { ascending: true });

  const carouselSlides = participantImagesToCarouselSlides(
    row.user_id,
    participantName,
    (imageData ?? []) as { id: string | number; image_url: string }[],
    placeholderUrl
  );
  const imageUrl = carouselSlides[0]?.imageUrl ?? placeholderUrl;
  const description = row.description?.trim() || null;
  const userInfo = Array.isArray(row.user_info)
    ? row.user_info[0]
    : row.user_info;
  const contactInfo = await buildContactInfo(
    supabase,
    row.user_id,
    userInfo as UserInfoRow
  );

  return {
    type: getParticipantType(row.special_program),
    slug: row.slug,
    userId: row.user_id,
    name: participantName,
    imageUrl,
    carouselSlides,
    displayNumber: row.display_number,
    description,
    status: row.status,
    is_sticky: isSticky,
    contactInfo,
  };
};
