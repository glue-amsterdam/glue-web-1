import type { HomeCitizensData, HomeStickyGroupData } from "@/lib/home/types";
import { formatYearNumbersTitle } from "@/lib/year-numbers/format-year-numbers-title";
import type { YearNumberItem } from "@/lib/year-numbers/fetch-year-numbers-for-year";

export type CitizensSectionProps = {
  title: string;
  description: string;
  citizens: HomeCitizensData["citizens"];
  sectionId?: string;
  headingLevel?: "h2" | "h3";
  archiveYear?: number;
  hasPadding?: boolean;
};

export type StickySectionProps = {
  title: string;
  description: string;
  year: number | null;
  groupPhotoUrl: string | null;
  additionalMembersText: string;
  participants: HomeStickyGroupData["participants"];
  sectionId?: string;
  showCta?: boolean;
};

export type YearNumbersSectionProps = {
  title: string;
  items: YearNumberItem[];
  sectionId?: string;
};

const fallbackCitizensTitle = (year: number | string) =>
  `Creative Citizens of Honour ${year}`;

const fallbackStickyTitle = (year: number | string) =>
  `Sticky participants ${year}`;

export const toCitizensSectionProps = (
  data: HomeCitizensData
): CitizensSectionProps => ({
  title: data.title || fallbackCitizensTitle(data.year),
  description: data.description,
  citizens: data.citizens,
});

export const toStickySectionProps = (
  data: HomeStickyGroupData
): StickySectionProps => ({
  title: data.title || (data.year != null ? fallbackStickyTitle(data.year) : "Sticky participants"),
  description: data.description,
  year: data.year,
  groupPhotoUrl: data.group_photo_url,
  additionalMembersText: data.additional_members_text,
  participants: data.participants,
});

export const toArchiveCitizensSectionProps = (
  year: number,
  data: HomeCitizensData
): CitizensSectionProps => ({
  title: data.title || fallbackCitizensTitle(year),
  description: data.description,
  citizens: data.citizens,
  sectionId: `archive-citizens-${year}`,
});

export const toArchiveStickySectionProps = (
  year: number,
  data: HomeStickyGroupData
): StickySectionProps => ({
  title: data.title || fallbackStickyTitle(year),
  description: data.description,
  year: data.year ?? year,
  groupPhotoUrl: data.group_photo_url,
  additionalMembersText: data.additional_members_text,
  participants: data.participants,
  sectionId: `archive-sticky-${year}`,
  showCta: false,
});

export const toArchiveYearNumbersSectionProps = (
  year: number,
  items: YearNumberItem[]
): YearNumbersSectionProps => ({
  title: formatYearNumbersTitle(year),
  items,
  sectionId: `archive-${year}-numbers`,
});
