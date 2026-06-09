export type ExtractedMediaItem = {
  imageUrl: string | null;
  videoUrl: string | null;
  width: number | null;
  height: number | null;
  maxWidth: string | null;
  maxHeight: string | null;
};

const parsePxValue = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (!match) return null;
  return Math.round(Number(match[1]));
};

const parseStyleValue = (
  style: string | null | undefined,
  property: "max-width" | "max-height" | "width" | "height"
): string | null => {
  if (!style) return null;
  const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, "i");
  const match = style.match(regex);
  return match ? match[1].trim() : null;
};

const getAttr = (tag: string, attr: string): string | null => {
  const regex = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i");
  const match = tag.match(regex);
  return match ? match[1] : null;
};

const getNumericAttr = (tag: string, attr: "width" | "height"): number | null => {
  const value = getAttr(tag, attr);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
};

const buildImgItem = (tag: string): ExtractedMediaItem | null => {
  const src = getAttr(tag, "src");
  if (!src) return null;

  const style = getAttr(tag, "style");
  const widthAttr = getAttr(tag, "width");
  const maxWidth =
    parseStyleValue(style, "max-width") ??
    (widthAttr ? `${widthAttr}px` : null);
  const maxHeight = parseStyleValue(style, "max-height");

  return {
    imageUrl: src,
    videoUrl: null,
    width:
      getNumericAttr(tag, "width") ?? parsePxValue(parseStyleValue(style, "width")),
    height:
      getNumericAttr(tag, "height") ??
      parsePxValue(parseStyleValue(style, "height")),
    maxWidth,
    maxHeight,
  };
};

const extractImgItems = (html: string): ExtractedMediaItem[] => {
  const items: ExtractedMediaItem[] = [];
  const linkedImgRegex =
    /<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>\s*<img\b[^>]*>\s*<\/a>/gi;
  const imgRegex = /<img\b[^>]*>/gi;
  const linkedRanges: Array<{ start: number; end: number }> = [];

  let linkedMatch: RegExpExecArray | null;
  while ((linkedMatch = linkedImgRegex.exec(html)) !== null) {
    const fullMatch = linkedMatch[0];
    const imgTagMatch = fullMatch.match(/<img\b[^>]*>/i);
    if (!imgTagMatch) continue;

    const item = buildImgItem(imgTagMatch[0]);
    if (item) {
      items.push(item);
    }

    linkedRanges.push({
      start: linkedMatch.index,
      end: linkedMatch.index + fullMatch.length,
    });
  }

  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const isInsideLinkedRange = linkedRanges.some(
      (range) => imgMatch!.index >= range.start && imgMatch!.index < range.end
    );
    if (isInsideLinkedRange) {
      continue;
    }

    const item = buildImgItem(imgMatch[0]);
    if (item) {
      items.push(item);
    }
  }

  return items;
};

const extractVideoItems = (html: string): ExtractedMediaItem[] => {
  const items: ExtractedMediaItem[] = [];
  const videoRegex = /<video\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = videoRegex.exec(html)) !== null) {
    const tag = match[0];
    const src = getAttr(tag, "src");
    if (!src) continue;

    const style = getAttr(tag, "style");

    items.push({
      imageUrl: null,
      videoUrl: src,
      width:
        getNumericAttr(tag, "width") ??
        parsePxValue(parseStyleValue(style, "width")),
      height:
        getNumericAttr(tag, "height") ??
        parsePxValue(parseStyleValue(style, "height")),
      maxWidth: parseStyleValue(style, "max-width") ?? "100%",
      maxHeight: parseStyleValue(style, "max-height"),
    });
  }

  return items;
};

export const extractMediaFromHtml = (html: string): ExtractedMediaItem[] => {
  if (!html.trim()) {
    return [];
  }

  return [...extractImgItems(html), ...extractVideoItems(html)];
};

export const collectMediaUrlsFromHtml = (html: string): string[] => {
  return extractMediaFromHtml(html)
    .map((item) => item.imageUrl ?? item.videoUrl)
    .filter((url): url is string => Boolean(url));
};
