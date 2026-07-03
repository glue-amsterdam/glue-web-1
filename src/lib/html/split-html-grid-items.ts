export const GLUE_GRID_ITEM_HR = '<hr data-glue-grid-item="" />';

export type HtmlGridSplitStrategy =
  | "auto"
  | "delimiter"
  | "paragraph"
  | "double-break";

const GLUE_GRID_ITEM_HR_PATTERN =
  /<hr\b[^>]*\bdata-glue-grid-item\b[^>]*\/?>/gi;

const PARAGRAPH_PATTERN = /<p\b[^>]*>[\s\S]*?<\/p>/gi;

const DOUBLE_BREAK_PATTERN = /<br\s*\/?>\s*<br\s*\/?>/gi;

const trimItems = (items: string[]): string[] =>
  items.map((item) => item.trim()).filter(Boolean);

const splitByDelimiter = (html: string): string[] => {
  const parts = html.split(GLUE_GRID_ITEM_HR_PATTERN);
  return trimItems(parts);
};

const splitByParagraph = (html: string): string[] => {
  const matches = html.match(PARAGRAPH_PATTERN);
  if (!matches?.length) {
    return [];
  }

  return trimItems(matches);
};

const splitByDoubleBreak = (html: string): string[] => {
  const parts = html.split(DOUBLE_BREAK_PATTERN);
  return trimItems(parts);
};

export const splitHtmlIntoGridItems = (
  html: string,
  strategy: HtmlGridSplitStrategy = "auto"
): string[] => {
  const normalizedHtml = html.trim();

  if (!normalizedHtml) {
    return [];
  }

  if (strategy === "delimiter") {
    const delimiterItems = splitByDelimiter(normalizedHtml);
    return delimiterItems.length > 0 ? delimiterItems : [normalizedHtml];
  }

  if (strategy === "paragraph") {
    const paragraphItems = splitByParagraph(normalizedHtml);
    return paragraphItems.length > 0 ? paragraphItems : [normalizedHtml];
  }

  if (strategy === "double-break") {
    const doubleBreakItems = splitByDoubleBreak(normalizedHtml);
    return doubleBreakItems.length > 0 ? doubleBreakItems : [normalizedHtml];
  }

  const delimiterItems = splitByDelimiter(normalizedHtml);
  if (delimiterItems.length > 1) {
    return delimiterItems;
  }

  const paragraphItems = splitByParagraph(normalizedHtml);
  if (paragraphItems.length > 1) {
    return paragraphItems;
  }

  const doubleBreakItems = splitByDoubleBreak(normalizedHtml);
  if (doubleBreakItems.length > 1) {
    return doubleBreakItems;
  }

  return [normalizedHtml];
};
