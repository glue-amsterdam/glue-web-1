import type { ExhibitorType } from "./exhibitor-types";

export const exhibitorTypeCssVars = {
  hub: "--hub-color",
  "up-to-three-participants": "--up-to-three-participants-color",
  "special-program": "--special-program-color",
} as const satisfies Record<ExhibitorType, string>;

export const exhibitorTypeFontCssVars = {
  hub: "--hub-font-color",
  "up-to-three-participants": "--up-to-three-participants-font-color",
  "special-program": "--special-program-font-color",
} as const satisfies Record<ExhibitorType, string>;

export const exhibitorTypeStyles: Record<
  ExhibitorType,
  { background: string; text: string; backgroundLight: string }
> = {
  hub: {
    background: "bg-[var(--hub-color)]",
    text: "text-[var(--hub-font-color)]",
    backgroundLight: "bg-[var(--hub-color)]/10",
  },
  "up-to-three-participants": {
    background: "bg-[var(--up-to-three-participants-color)]",
    text: "text-[var(--up-to-three-participants-font-color)]",
    backgroundLight: "bg-[var(--up-to-three-participants-color)]/10",
  },
  "special-program": {
    background: "bg-[var(--special-program-color)]",
    text: "text-[var(--special-program-font-color)]",
    backgroundLight: "bg-[var(--special-program-color)]/10",
  },
};

/** Fallback inline `color` for map and non-Tailwind contexts */
export const exhibitorTypeForegroundHex: Record<ExhibitorType, string> = {
  hub: "#ffffff",
  "up-to-three-participants": "#000000",
  "special-program": "#ffffff",
};

/** Default fill colors for Mapbox layers (aligned with `getTheme()` / layout CSS vars) */
export const exhibitorTypeBackgroundHex: Record<ExhibitorType, string> = {
  hub: "#10069F",
  "up-to-three-participants": "#d0b6d5",
  "special-program": "#090359",
};

export const MAP_ROUTE_STOP_BACKGROUND_HEX = "#ef4444";

export const exhibitorTypeBackgroundCss = (type: ExhibitorType): string =>
  `var(${exhibitorTypeCssVars[type]})`;

export const exhibitorTypeFontCss = (type: ExhibitorType): string =>
  `var(${exhibitorTypeFontCssVars[type]})`;

export const getExhibitorFontColorFromDocument = (
  type: ExhibitorType
): string => {
  if (typeof document === "undefined") {
    return exhibitorTypeForegroundHex[type];
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(exhibitorTypeFontCssVars[type])
    .trim();

  return value || exhibitorTypeForegroundHex[type];
};
