import type { HomeCitizensData, HomeStickyGroupData } from "@/lib/home/types";
import { formatYearNumbersTitle } from "@/lib/year-numbers/format-year-numbers-title";
import type { YearNumberItem } from "@/lib/year-numbers/fetch-year-numbers-for-year";

export type CitizensSectionProps = {
  title: string;
  description: string;
  citizens: HomeCitizensData["citizens"];
  sectionId?: string;
  isVisible?: boolean;
};

export type StickySectionProps = {
  title: string;
  description: string;
  year: number | null;
  groupPhotoUrl: string | null;
  participants: HomeStickyGroupData["participants"];
  sectionId?: string;
  isVisible?: boolean;
  showCta?: boolean;
};

export type YearNumbersSectionProps = {
  title: string;
  items: YearNumberItem[];
  sectionId?: string;
};

export const toCitizensSectionProps = (
  data: HomeCitizensData
): CitizensSectionProps => ({
  title: data.title,
  description: data.description,
  citizens: data.citizens,
  isVisible: data.is_visible,
});

export const toStickySectionProps = (
  data: HomeStickyGroupData
): StickySectionProps => ({
  title: data.title,
  description: data.description,
  year: data.year,
  groupPhotoUrl: data.group_photo_url,
  participants: data.participants,
  isVisible: data.is_visible,
});

export const toArchiveCitizensSectionProps = (
  year: number,
  data: HomeCitizensData
): CitizensSectionProps => ({
  title: `Creative Citizens of Honour ${year}`,
  description: data.description,
  citizens: data.citizens,
  sectionId: `archive-citizens-${year}`,
  isVisible: true,
});

export const toArchiveStickySectionProps = (
  year: number,
  data: HomeStickyGroupData
): StickySectionProps => ({
  title: `Sticky participants ${year}`,
  description: data.description,
  year: data.year ?? year,
  groupPhotoUrl: data.group_photo_url,
  participants: data.participants,
  sectionId: `archive-sticky-${year}`,
  isVisible: true,
});

export const toArchiveYearNumbersSectionProps = (
  year: number,
  items: YearNumberItem[]
): YearNumbersSectionProps => ({
  title: formatYearNumbersTitle(year),
  items,
  sectionId: `archive-${year}-numbers`,
});
