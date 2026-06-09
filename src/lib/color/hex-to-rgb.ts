export type Rgb = { r: number; g: number; b: number };

const clampChannel = (value: number): number =>
  Math.max(0, Math.min(255, Math.round(value)));

/** Parses #RGB, #RRGGBB, or rgb(r,g,b) into 0–255 channels. Falls back to black. */
export const hexToRgb = (input: string): Rgb => {
  const trimmed = input.trim();

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i
  );
  if (rgbMatch) {
    return {
      r: clampChannel(Number(rgbMatch[1])),
      g: clampChannel(Number(rgbMatch[2])),
      b: clampChannel(Number(rgbMatch[3])),
    };
  }

  const hex = trimmed.replace(/^#/, "");
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return { r: 0, g: 0, b: 0 };
};
