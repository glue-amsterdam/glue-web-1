import sanitizeHtmlLib from "sanitize-html";

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

const POST_HTML_ALLOWED_ATTRIBUTES: sanitizeHtmlLib.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height", "style", "class"],
  video: ["src", "controls", "width", "height", "style", "class"],
  span: ["style", "class", "data-align"],
  div: ["style", "class", "data-align"],
  p: ["style", "class", "data-align"],
  h1: ["style", "class", "data-align"],
  h2: ["style", "class", "data-align"],
  h3: ["style", "class", "data-align"],
  blockquote: ["style", "class"],
  ul: ["style", "class"],
  ol: ["style", "class"],
  li: ["style", "class"],
};

const GENERAL_ALLOWED_TAGS = [
  ...sanitizeHtmlLib.defaults.allowedTags,
  "img",
  "video",
];

const GENERAL_ALLOWED_ATTRIBUTES: sanitizeHtmlLib.IOptions["allowedAttributes"] = {
  ...sanitizeHtmlLib.defaults.allowedAttributes,
  img: ["src", "alt", "width", "height", "style", "class"],
  video: ["src", "controls", "width", "height", "style", "class"],
};

export const sanitizeHtml = (html: string): string => {
  if (!html) {
    return "";
  }

  return sanitizeHtmlLib(html, {
    allowedTags: GENERAL_ALLOWED_TAGS,
    allowedAttributes: GENERAL_ALLOWED_ATTRIBUTES,
  });
};

export const sanitizePostHtml = (html: string): string => {
  if (!html) {
    return "";
  }

  return sanitizeHtmlLib(html, {
    allowedTags: POST_HTML_ALLOWED_TAGS,
    allowedAttributes: POST_HTML_ALLOWED_ATTRIBUTES,
  });
};

export const stripHtmlTags = (html: string): string => {
  if (!html) {
    return "";
  }

  return sanitizeHtmlLib(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
};
