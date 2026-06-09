import type { HomeTextItem, HomeTextPlacement } from "@/schemas/mainSchema";

type HomeTextDbRow = {
  id: string;
  label: string;
  color?: string | null;
  href?: string | null;
  placement?: string | null;
  sort_order?: number | null;
};

const PLACEMENTS: HomeTextPlacement[] = [
  "marquee",
  "footer_left",
  "footer_right",
];

const isHomeTextPlacement = (value: string | null | undefined): value is HomeTextPlacement =>
  !!value && PLACEMENTS.includes(value as HomeTextPlacement);

export const mapHomeTextFromRow = (row: HomeTextDbRow): HomeTextItem => ({
  id: row.id,
  label: row.label,
  color: row.color ?? null,
  href: row.href?.trim() ? row.href.trim() : null,
  placement: isHomeTextPlacement(row.placement) ? row.placement : "marquee",
  sort_order: row.sort_order ?? 0,
});

export const mapHomeTextsFromRows = (rows: HomeTextDbRow[] | null): HomeTextItem[] =>
  (rows ?? []).map(mapHomeTextFromRow);
