const extractAttr = (attrs: string, name: string): string | null => {
  const match = attrs.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? match[1] : null;
};

const stripAttrs = (attrs: string, names: string[]): string => {
  let cleaned = attrs;
  for (const name of names) {
    cleaned = cleaned.replace(new RegExp(`${name}\\s*=\\s*["'][^"']*["']`, "gi"), "");
  }
  return cleaned.replace(/\s+/g, " ").trim();
};

const buildImgTag = (attrs: string, src: string): string => {
  const cleaned = stripAttrs(attrs, ["clickable", "link", "src"]);
  let tag = "<img";
  if (cleaned) {
    tag += ` ${cleaned}`;
  }
  tag += ` src="${src}"`;
  return tag;
};

/**
 * Converts legacy email template image markup into PostImage-compatible HTML
 * so the post rich text editor can load and edit existing templates.
 */
export const normalizeEmailHtmlForEditor = (html: string): string => {
  let processed = html;

  const clickableImgRegex =
    /<img\s+([^>]*?)clickable\s*=\s*["']true["']([^>]*?)\/?>/gi;

  processed = processed.replace(clickableImgRegex, (match, before, after) => {
    const attrs = `${before} ${after}`;
    const linkUrl = extractAttr(attrs, "link");
    const src = extractAttr(attrs, "src") || linkUrl;

    if (!src) {
      return match;
    }

    const imgTag = `${buildImgTag(attrs, src)}>`;

    const redirectUrl =
      linkUrl && linkUrl !== src && !linkUrl.endsWith("#redirect")
        ? linkUrl
        : null;

    if (redirectUrl) {
      return `<a href="${redirectUrl}" target="_blank" rel="noopener noreferrer">${imgTag}</a>`;
    }

    return imgTag;
  });

  const linkOnlyImgRegex =
    /<img\s+([^>]*?)(?!clickable\s*=\s*["']true["'])link\s*=\s*["']([^"']+)["']([^>]*?)\/?>/gi;

  processed = processed.replace(
    linkOnlyImgRegex,
    (match, before, linkUrl, after) => {
      const attrs = `${before} ${after}`;
      const existingSrc = extractAttr(attrs, "src");
      const src = existingSrc || linkUrl;
      return `${buildImgTag(attrs, src)}>`;
    }
  );

  return processed;
};
