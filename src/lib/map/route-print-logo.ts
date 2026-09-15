import { buildGlueLogoSvg } from "@/lib/branding/glue-logo-mark";

/** SVG data URL for the GLUE mark, suitable for HTML print `<img>`. */
export const buildGlueLogoSrc = (fillColor: string): string => {
  const svg = buildGlueLogoSvg(fillColor);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
