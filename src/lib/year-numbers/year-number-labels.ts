export const YEAR_NUMBER_LABELS = [
  "Spaces",
  "Exhibitors",
  "Sticky",
  "Visitors",
] as const;

export type YearNumberLabel = (typeof YEAR_NUMBER_LABELS)[number];
