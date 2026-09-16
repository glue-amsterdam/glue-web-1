/** Serialize structured data for a JSON-LD script tag (Next.js-safe). */
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");
