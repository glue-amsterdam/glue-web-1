import type { MainColorsFormData, SiteThemeColors } from "@/schemas/mainSchema";

export const DEFAULT_SITE_THEME: SiteThemeColors = {
  primaryColor: "#10069F",
  backgroundColor: "#FFFFFF",
  blackColor: "#000000",
  whiteColor: "#FFFFFF",
};

export type MainColorsDbRow = {
  box1?: string | null;
  box2?: string | null;
  box3?: string | null;
  box4?: string | null;
  triangle?: string | null;
  primary_color?: string | null;
  background_color?: string | null;
  black_color?: string | null;
  white_color?: string | null;
};

export const mapSiteThemeFromRow = (row: MainColorsDbRow): SiteThemeColors => ({
  primaryColor: row.primary_color ?? DEFAULT_SITE_THEME.primaryColor,
  backgroundColor: row.background_color ?? DEFAULT_SITE_THEME.backgroundColor,
  blackColor: row.black_color ?? DEFAULT_SITE_THEME.blackColor,
  whiteColor: row.white_color ?? DEFAULT_SITE_THEME.whiteColor,
});

export const dbRowToMainColorsForm = (row: MainColorsDbRow): MainColorsFormData => ({
  box1: row.box1 ?? "#000000",
  box2: row.box2 ?? "#000000",
  box3: row.box3 ?? "#000000",
  box4: row.box4 ?? "#000000",
  triangle: row.triangle ?? "#000000",
  ...mapSiteThemeFromRow(row),
});

export const mainColorsFormToDbRow = (
  data: MainColorsFormData
): MainColorsDbRow => ({
  box1: data.box1,
  box2: data.box2,
  box3: data.box3,
  box4: data.box4,
  triangle: data.triangle,
  primary_color: data.primaryColor,
  background_color: data.backgroundColor,
  black_color: data.blackColor,
  white_color: data.whiteColor,
});
