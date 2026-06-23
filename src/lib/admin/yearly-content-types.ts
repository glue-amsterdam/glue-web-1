export type YearlyContentSection =
  | "year-numbers"
  | "sticky"
  | "citizens"
  | "archive";

export type YearlyContentYearStatus = {
  year: number;
  year_numbers: { configured: boolean };
  sticky: { available: boolean; count: number; has_photo: boolean };
  citizens: { available: boolean; count: number };
  archive: { configured: boolean; has_media: boolean };
};

export const YEARLY_CONTENT_SECTION_LABELS: Record<
  YearlyContentSection,
  string
> = {
  "year-numbers": "Year Numbers",
  sticky: "Sticky Group",
  citizens: "Citizens of Honour",
  archive: "Archive",
};
