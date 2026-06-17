import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";

export type MapCategoryFilterOption = {
  value: ExhibitorsFilterType;
  label: string;
};

/** Labels shown in the map category filter (legend-style, bottom panel). */
export const MAP_CATEGORY_FILTER_OPTIONS: MapCategoryFilterOption[] = [
  {
    value: "hub",
    label: "GLUE HUB, 3 or more participants in one location",
  },
  {
    value: "up-to-three-participants",
    label: "Up to 3 GLUE participants",
  },
  {
    value: "special-program",
    label: "Special Program",
  },
];
