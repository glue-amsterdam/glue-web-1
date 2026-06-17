import type {
  ExhibitorItem,
  ExhibitorSortField,
  ExhibitorSortOrder,
} from "./exhibitor-types";
import type { ExhibitorsFilterType } from "./exhibitors-filters";
import { sortExhibitors } from "./sort-exhibitors";

export const filterExhibitorsByType = (
  items: ExhibitorItem[],
  type: ExhibitorsFilterType
): ExhibitorItem[] => {
  if (type === "all") return items;
  return items.filter((item) => item.type === type);
};

export const filterExhibitorsBySearch = (
  items: ExhibitorItem[],
  q: string
): ExhibitorItem[] => {
  const normalizedQuery = q.trim().toLowerCase();
  if (!normalizedQuery) return items;

  return items.filter((item) =>
    item.name.toLowerCase().includes(normalizedQuery)
  );
};

export const applyExhibitorsFilters = (
  items: ExhibitorItem[],
  filters: {
    type: ExhibitorsFilterType;
    sort: ExhibitorSortField;
    order: ExhibitorSortOrder;
    q: string;
  }
): ExhibitorItem[] => {
  let result = filterExhibitorsByType(items, filters.type);
  result = filterExhibitorsBySearch(result, filters.q);
  return sortExhibitors(result, filters.sort, filters.order);
};

export const paginateExhibitors = (
  items: ExhibitorItem[],
  offset: number,
  limit: number
): {
  pageItems: ExhibitorItem[];
  total: number;
  hasMore: boolean;
} => {
  const total = items.length;
  const pageItems = items.slice(offset, offset + limit);

  return {
    pageItems,
    total,
    hasMore: offset + pageItems.length < total,
  };
};
