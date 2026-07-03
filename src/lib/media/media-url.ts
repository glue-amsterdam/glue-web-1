import { config } from "@/config";

const PUBLIC_OBJECT_MARKER = "/storage/v1/object/public/";

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

// Storage keys never start with "/". A leading slash (or data:/blob:) marks a
// local public asset or in-memory preview that must be left untouched.
const isLocalOrInline = (value: string): boolean =>
  value.startsWith("/") ||
  value.startsWith("data:") ||
  value.startsWith("blob:");

const stripLeadingSlash = (value: string): string =>
  value.startsWith("/") ? value.slice(1) : value;

/**
 * Converts a stored value into a bucket-relative key.
 * Accepts already-relative keys, legacy absolute Supabase URLs, or custom-domain
 * URLs that share the configured media base. Returns the input unchanged when it
 * cannot be parsed so callers stay defensive during the migration window.
 */
export const toMediaKey = (
  value: string | null | undefined
): string | null | undefined => {
  if (!value) {
    return value;
  }

  if (isLocalOrInline(value)) {
    return value;
  }

  if (config.mediaBaseUrl && value.startsWith(config.mediaBaseUrl)) {
    return value.slice(config.mediaBaseUrl.length);
  }

  const markerIndex = value.indexOf(PUBLIC_OBJECT_MARKER);
  if (markerIndex !== -1) {
    const bucketAndPath = value.slice(markerIndex + PUBLIC_OBJECT_MARKER.length);
    const firstSlashIndex = bucketAndPath.indexOf("/");
    if (firstSlashIndex === -1) {
      return bucketAndPath;
    }
    return bucketAndPath.slice(firstSlashIndex + 1);
  }

  if (isAbsoluteUrl(value)) {
    return value;
  }

  return stripLeadingSlash(value);
};

/**
 * Builds the full public URL for a bucket-relative key. Falsy values and values
 * that are already absolute URLs are returned untouched (defensive transition).
 */
export const toMediaUrl = (
  value: string | null | undefined
): string | null | undefined => {
  if (!value) {
    return value;
  }

  if (isAbsoluteUrl(value) || isLocalOrInline(value)) {
    return value;
  }

  return `${config.mediaBaseUrl}${value}`;
};

const SRC_ATTR_REGEX = /(<(?:img|video|source)\b[^>]*?\ssrc\s*=\s*)(["'])(.*?)\2/gi;

/**
 * Rewrites `src` attributes of media tags inside an HTML string using `transform`.
 */
const rewriteHtmlMediaSrc = (
  html: string,
  transform: (src: string) => string | null | undefined
): string => {
  if (!html) {
    return html;
  }

  return html.replace(
    SRC_ATTR_REGEX,
    (match, prefix: string, quote: string, src: string) => {
      const next = transform(src);
      if (!next) {
        return match;
      }
      return `${prefix}${quote}${next}${quote}`;
    }
  );
};

/** Shortens absolute media URLs to bucket-relative keys inside HTML (for storage). */
export const rewriteHtmlMediaToKeys = (html: string): string =>
  rewriteHtmlMediaSrc(html, (src) => toMediaKey(src));

/** Expands bucket-relative keys to full URLs inside HTML (for display/editor). */
export const rewriteHtmlKeysToUrls = (html: string): string =>
  rewriteHtmlMediaSrc(html, (src) => toMediaUrl(src));
