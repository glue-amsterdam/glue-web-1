import type { ParticipantCategory } from "./participant-categories";
import { getCategoryCssVarNames } from "./participant-categories";

export const MAP_ROUTE_STOP_BACKGROUND_HEX = "#ef4444";

export const categoryCssVar = (slug: string): string =>
  `var(${getCategoryCssVarNames(slug).bg})`;

export const categoryFontCssVar = (slug: string): string =>
  `var(${getCategoryCssVarNames(slug).font})`;

export type CategoryInlineStyles = {
  backgroundColor: string;
  color: string;
  backgroundColorLight: string;
};

export const getCategoryInlineStyles = (slug: string): CategoryInlineStyles => {
  const { bg, font } = getCategoryCssVarNames(slug);
  return {
    backgroundColor: `var(${bg})`,
    color: `var(${font})`,
    backgroundColorLight: `color-mix(in srgb, var(${bg}) 10%, transparent)`,
  };
};

export const getCategoryFontColorFromDocument = (
  slug: string,
  fallback = "#ffffff"
): string => {
  if (typeof document === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(getCategoryCssVarNames(slug).font)
    .trim();

  return value || fallback;
};

export const getCategoryBackgroundFromDocument = (
  slug: string,
  fallback = "#000000"
): string => {
  if (typeof document === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(getCategoryCssVarNames(slug).bg)
    .trim();

  return value || fallback;
};

export const buildDefaultCategoryColorMap = (
  categories: ParticipantCategory[]
): Record<string, { bg: string; font: string }> => {
  const map: Record<string, { bg: string; font: string }> = {};
  for (const category of categories) {
    map[category.slug] = {
      bg: category.bgColor,
      font: category.fontColor,
    };
  }
  return map;
};
