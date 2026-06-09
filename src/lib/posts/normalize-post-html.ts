import type { PostImageAlign } from "@/app/components/tiptap-post-image";

const MAX_WIDTH_REGEX = /max-width:\s*([^;]+)/i;
const POST_IMAGE_CLASS = "post-image";
const POST_IMAGE_TAG_REGEX = /<img\b[^>]*class="[^"]*post-image[^"]*"[^>]*>/gi;
const LINKED_POST_IMAGE_REGEX =
  /<a\b([^>]*)>\s*(<img\b[^>]*class="[^"]*post-image[^"]*"[^>]*>)\s*<\/a>/gi;

const parseAlign = (value: string | null): PostImageAlign => {
  if (value === "center" || value === "right") {
    return value;
  }
  return "left";
};

export type ResponsiveImageStyle = {
  width: string;
  maxWidth: string;
  height: string;
};

export const getResponsiveImageStyleObject = (
  maxWidth: string
): ResponsiveImageStyle => {
  const normalized = maxWidth.trim();

  if (normalized === "100%") {
    return {
      width: "100%",
      maxWidth: "100%",
      height: "auto",
    };
  }

  return {
    width: "100%",
    maxWidth: `min(${normalized}, 100%)`,
    height: "auto",
  };
};

export const buildResponsiveImageStyle = (maxWidth: string): string => {
  const style = getResponsiveImageStyleObject(maxWidth);

  return `width: ${style.width}; max-width: ${style.maxWidth}; height: ${style.height};`;
};

const extractMaxWidthFromStyle = (style: string | null): string => {
  if (!style) {
    return "600px";
  }

  const minMatch = style.match(/max-width:\s*min\(\s*([^,]+)\s*,/i);
  if (minMatch) {
    return minMatch[1].trim();
  }

  const match = style.match(MAX_WIDTH_REGEX);
  return match ? match[1].trim() : "600px";
};

const replaceStyleAttribute = (tag: string, nextStyle: string): string => {
  if (/\sstyle\s*=/.test(tag)) {
    return tag.replace(
      /\sstyle\s*=\s*(["'])(.*?)\1/i,
      ` style="${nextStyle}"`
    );
  }

  return tag.replace(/<img\b/i, `<img style="${nextStyle}"`);
};

const normalizePostImageTag = (tag: string): string => {
  if (!tag.includes(POST_IMAGE_CLASS)) {
    return tag;
  }

  const styleMatch = tag.match(/\sstyle\s*=\s*(["'])(.*?)\1/i);
  const currentStyle = styleMatch?.[2] ?? null;
  const maxWidth = extractMaxWidthFromStyle(currentStyle);

  return replaceStyleAttribute(tag, buildResponsiveImageStyle(maxWidth));
};

const isInsideOpenAnchor = (html: string, index: number): boolean => {
  const before = html.slice(0, index);
  const lastOpenA = before.lastIndexOf("<a");
  const lastCloseA = before.lastIndexOf("</a>");

  return lastOpenA > lastCloseA;
};

const addPostImageLinkClass = (anchorAttrs: string): string => {
  if (/\sclass\s*=/.test(anchorAttrs)) {
    return anchorAttrs.replace(
      /\sclass\s*=\s*(["'])(.*?)\1/i,
      (_match, quote: string, classes: string) => {
        if (classes.includes("post-image-link")) {
          return ` class=${quote}${classes}${quote}`;
        }

        return ` class=${quote}${classes} post-image-link${quote}`;
      }
    );
  }

  return `${anchorAttrs} class="post-image-link"`;
};

const wrapLinkedPostImages = (html: string): string =>
  html.replace(LINKED_POST_IMAGE_REGEX, (_match, anchorAttrs, imgTag) => {
    const normalizedImg = normalizePostImageTag(imgTag);
    const nextAnchorAttrs = addPostImageLinkClass(anchorAttrs);

    return `<a${nextAnchorAttrs}>${normalizedImg}</a>`;
  });

const wrapStandalonePostImages = (html: string): string =>
  html.replace(POST_IMAGE_TAG_REGEX, (imgTag, offset) => {
    const normalizedImg = normalizePostImageTag(imgTag);

    if (isInsideOpenAnchor(html, offset)) {
      return normalizedImg;
    }

    const alignMatch = normalizedImg.match(/\sdata-align\s*=\s*(["'])(.*?)\1/i);
    const align = parseAlign(alignMatch?.[2] ?? null);

    return `<div class="post-image-wrapper post-image-wrapper--${align}">${normalizedImg}</div>`;
  });

const normalizePostVideos = (html: string): string => {
  const videoRegex = /<video\b([^>]*)>/gi;

  return html.replace(videoRegex, (_match, attrs: string) => {
    const styleMatch = attrs.match(/\sstyle\s*=\s*(["'])(.*?)\1/i);
    const currentStyle = styleMatch?.[2] ?? "";
    const hasWidth = /width\s*:/i.test(currentStyle);
    const hasMaxWidth = /max-width\s*:/i.test(currentStyle);

    let nextStyle = currentStyle.trim();

    if (!hasWidth) {
      nextStyle = nextStyle ? `${nextStyle}; width: 100%;` : "width: 100%;";
    }

    if (!hasMaxWidth) {
      nextStyle = nextStyle
        ? `${nextStyle}; max-width: 100%;`
        : "max-width: 100%;";
    }

    if (!/height\s*:/i.test(nextStyle)) {
      nextStyle = nextStyle ? `${nextStyle}; height: auto;` : "height: auto;";
    }

    if (styleMatch) {
      return `<video${attrs.replace(
        /\sstyle\s*=\s*(["'])(.*?)\1/i,
        ` style="${nextStyle}"`
      )}>`;
    }

    return `<video style="${nextStyle}"${attrs}>`;
  });
};

export const normalizePostImagesForDisplay = (html: string): string => {
  if (!html.trim()) {
    return "";
  }

  const withLinkedImages = wrapLinkedPostImages(html);
  const withWrappedImages = wrapStandalonePostImages(withLinkedImages);

  return normalizePostVideos(withWrappedImages);
};
