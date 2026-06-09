import DOMPurify from "isomorphic-dompurify";

const POST_HTML_ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "br",
  "blockquote",
  "img",
  "video",
  "span",
  "div",
];

const POST_HTML_ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "style",
  "class",
  "data-align",
  "controls",
  "width",
  "height",
  "target",
  "rel",
];

export const sanitizeHtml = (html: string): string => {
  if (!html) {
    return "";
  }

  return DOMPurify.sanitize(html);
};

export const sanitizePostHtml = (html: string): string => {
  if (!html) {
    return "";
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: POST_HTML_ALLOWED_TAGS,
    ALLOWED_ATTR: POST_HTML_ALLOWED_ATTR,
  });
};

export const stripHtmlTags = (html: string): string => {
  if (!html) {
    return "";
  }

  return sanitizeHtml(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};
