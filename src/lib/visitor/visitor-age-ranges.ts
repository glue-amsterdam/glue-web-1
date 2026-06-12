export const VISITOR_AGE_RANGES = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
] as const;

export type VisitorAgeRange = (typeof VISITOR_AGE_RANGES)[number];

export const VISITOR_AGE_RANGE_LABELS: Record<VisitorAgeRange, string> = {
  "18-24": "18–24",
  "25-34": "25–34",
  "35-44": "35–44",
  "45-54": "45–54",
  "55-64": "55–64",
  "65+": "65+",
};

export const isVisitorAgeRange = (value: string): value is VisitorAgeRange =>
  (VISITOR_AGE_RANGES as readonly string[]).includes(value);
