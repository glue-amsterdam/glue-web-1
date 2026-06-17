import type {
  ExhibitorSortField,
  ExhibitorSortOrder,
  ExhibitorType,
} from "@/lib/participants/exhibitor-types";

export const EXHIBITORS_PAGE_SIZE = 30;

export type ExhibitorsFilterType = ExhibitorType | "all";

export type ExhibitorsFilters = {
  type: ExhibitorsFilterType;
  sort: ExhibitorSortField;
  order: ExhibitorSortOrder;
  q: string;
};

export const DEFAULT_EXHIBITORS_FILTERS: ExhibitorsFilters = {
  type: "all",
  sort: "displayNumber",
  order: "asc",
  q: "",
};

export const EXHIBITOR_TYPE_OPTIONS: {
  value: ExhibitorsFilterType;
  label: string;
}[] = [
    { value: "hub", label: "GLUE HUB" },
    { value: "up-to-three-participants", label: "Up to 3 GLUE participants" },
    { value: "special-program", label: "Special program" },
  ];

export const EXHIBITOR_SORT_OPTIONS: {
  value: ExhibitorSortField;
  label: string;
}[] = [
    { value: "displayNumber", label: "Display number" },
    { value: "name", label: "Name" },
  ];

export const EXHIBITOR_ORDER_OPTIONS: {
  value: ExhibitorSortOrder;
  label: string;
}[] = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

export const getExhibitorItemKey = (item: {
  userId?: string;
  hubId?: string;
  name: string;
}): string => {
  return item.userId ?? item.hubId ?? item.name;
};

export const getExhibitorDisplayNumber = (item: {
  displayNumber: string | null;
  hubDisplayNumber: string | null;
}): string => {
  return item.displayNumber ?? item.hubDisplayNumber ?? " ";
};

export const getExhibitorLink = (item: {
  slug?: string;
  hubId?: string;
}): string | null => {
  if (item.slug) return `/exhibitors/${item.slug}`;
  if (item.hubId) return `/exhibitors/hub/${item.hubId}`;
  return null;
};
