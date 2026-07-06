import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExhibitorType } from "./exhibitor-types";

export type ParticipantCategoryDbRow = {
  id: string;
  slug: string;
  label: string;
  bg_color: string;
  font_color: string;
  sort_order: number;
  is_default: boolean;
  is_structural: boolean;
  assignable: boolean;
  show_in_filters: boolean;
  is_protected: boolean;
};

export type ParticipantCategory = {
  id: string;
  slug: string;
  label: string;
  bgColor: string;
  fontColor: string;
  sortOrder: number;
  isDefault: boolean;
  isStructural: boolean;
  assignable: boolean;
  showInFilters: boolean;
  isProtected: boolean;
};

export const DEFAULT_PARTICIPANT_CATEGORIES: ParticipantCategory[] = [
  {
    id: "default-hub",
    slug: "hub",
    label: "GLUE HUB",
    bgColor: "#10069F",
    fontColor: "#FFFFFF",
    sortOrder: 0,
    isDefault: false,
    isStructural: true,
    assignable: false,
    showInFilters: true,
    isProtected: true,
  },
  {
    id: "default-standard",
    slug: "standard",
    label: "Up to 3 GLUE participants",
    bgColor: "#d0b6d5",
    fontColor: "#000000",
    sortOrder: 1,
    isDefault: true,
    isStructural: false,
    assignable: false,
    showInFilters: true,
    isProtected: true,
  },
  {
    id: "default-special-program",
    slug: "special-program",
    label: "Special Program",
    bgColor: "#090359",
    fontColor: "#FFFFFF",
    sortOrder: 2,
    isDefault: false,
    isStructural: false,
    assignable: true,
    showInFilters: true,
    isProtected: false,
  },
];

/** Legacy URL slug from before dynamic categories */
export const LEGACY_CATEGORY_SLUG_ALIASES: Record<string, string> = {
  "up-to-three-participants": "standard",
};

export const normalizeCategorySlug = (slug: string): string =>
  LEGACY_CATEGORY_SLUG_ALIASES[slug] ?? slug;

export const mapParticipantCategoryFromRow = (
  row: ParticipantCategoryDbRow
): ParticipantCategory => ({
  id: row.id,
  slug: row.slug,
  label: row.label,
  bgColor: row.bg_color,
  fontColor: row.font_color,
  sortOrder: row.sort_order,
  isDefault: row.is_default,
  isStructural: row.is_structural,
  assignable: row.assignable,
  showInFilters: row.show_in_filters,
  isProtected: row.is_protected,
});

export const fetchParticipantCategories = async (
  supabase: SupabaseClient
): Promise<ParticipantCategory[]> => {
  const { data, error } = await supabase
    .from("participant_categories")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("Error fetching participant categories:", error);
    return DEFAULT_PARTICIPANT_CATEGORIES;
  }

  if (!data || data.length === 0) {
    return DEFAULT_PARTICIPANT_CATEGORIES;
  }

  return (data as ParticipantCategoryDbRow[]).map(mapParticipantCategoryFromRow);
};

export const getCategoryCssVarNames = (
  slug: string
): { bg: string; font: string } => ({
  bg: `--cat-${slug}-color`,
  font: `--cat-${slug}-font-color`,
});

export const getCategoryBySlug = (
  categories: ParticipantCategory[],
  slug: string
): ParticipantCategory | undefined => {
  const normalized = normalizeCategorySlug(slug);
  return categories.find((c) => c.slug === normalized);
};

export const getDefaultCategory = (
  categories: ParticipantCategory[]
): ParticipantCategory => {
  return (
    categories.find((c) => c.isDefault) ??
    categories.find((c) => c.slug === "standard") ??
    categories[0] ??
    DEFAULT_PARTICIPANT_CATEGORIES[1]
  );
};

export const getStructuralCategory = (
  categories: ParticipantCategory[]
): ParticipantCategory => {
  return (
    categories.find((c) => c.isStructural) ??
    categories.find((c) => c.slug === "hub") ??
    DEFAULT_PARTICIPANT_CATEGORIES[0]
  );
};

export const getAssignableCategories = (
  categories: ParticipantCategory[]
): ParticipantCategory[] =>
  categories.filter((c) => c.assignable).sort((a, b) => a.sortOrder - b.sortOrder);

export const getFilterCategories = (
  categories: ParticipantCategory[]
): ParticipantCategory[] =>
  categories.filter((c) => c.showInFilters).sort((a, b) => a.sortOrder - b.sortOrder);

export type CategoryFilterOption = {
  value: string;
  label: string;
};

export const buildCategoryFilterOptions = (
  categories: ParticipantCategory[]
): CategoryFilterOption[] =>
  getFilterCategories(categories).map((c) => ({
    value: c.slug,
    label: c.label,
  }));

export const getValidFilterSlugs = (
  categories: ParticipantCategory[]
): string[] => categories.map((c) => c.slug);

export const classifyCategory = (
  memberCount: number,
  assignedSlug: string | null | undefined,
  categories: ParticipantCategory[]
): ExhibitorType => {
  if (memberCount > 3) {
    return getStructuralCategory(categories).slug;
  }

  const normalized = assignedSlug
    ? normalizeCategorySlug(assignedSlug)
    : undefined;
  const assigned = normalized
    ? getCategoryBySlug(categories, normalized)
    : undefined;

  if (assigned && !assigned.isStructural) {
    return assigned.slug;
  }

  return getDefaultCategory(categories).slug;
};

/** Hub members inherit the hub color unless they have an assignable category. */
export const classifyHubMemberCategory = (
  assignedSlug: string | null | undefined,
  categories: ParticipantCategory[]
): ExhibitorType => {
  const normalized = assignedSlug
    ? normalizeCategorySlug(assignedSlug)
    : undefined;
  const assigned = normalized
    ? getCategoryBySlug(categories, normalized)
    : undefined;

  if (assigned?.assignable) {
    return assigned.slug;
  }

  return getStructuralCategory(categories).slug;
};

export const getModeratorCategoryOptions = (
  categories: ParticipantCategory[]
): CategoryFilterOption[] => {
  const standard = getDefaultCategory(categories);
  const assignable = getAssignableCategories(categories);
  const options: CategoryFilterOption[] = [
    { value: standard.slug, label: standard.label },
  ];

  for (const category of assignable) {
    if (category.slug === standard.slug) continue;
    options.push({ value: category.slug, label: category.label });
  }

  return options;
};

/** Switch UI: ON selects assignable slug; OFF active switch resets to standard. */
export const resolveModeratorCategorySwitchChange = (
  currentSlug: string,
  toggledSlug: string,
  checked: boolean,
  standardSlug: string
): string => {
  if (checked) {
    return toggledSlug;
  }

  if (currentSlug === toggledSlug) {
    return standardSlug;
  }

  return currentSlug;
};

export const isModeratorCategorySwitchChecked = (
  currentSlug: string,
  assignableSlug: string,
  standardSlug: string
): boolean => currentSlug === assignableSlug && currentSlug !== standardSlug;

export const buildCategoryCssVars = (
  categories: ParticipantCategory[]
): Record<string, string> => {
  const vars: Record<string, string> = {};
  for (const category of categories) {
    const { bg, font } = getCategoryCssVarNames(category.slug);
    vars[bg] = category.bgColor;
    vars[font] = category.fontColor;
  }
  return vars;
};

export const buildMarkerStackOrder = (
  categories: ParticipantCategory[]
): Record<string, number> => {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const order: Record<string, number> = {};
  sorted.forEach((category, index) => {
    order[category.slug] = index;
  });
  return order;
};

export const getMapMarkerImageId = (slug: string): string =>
  `map-marker-${slug}`;

export const getExhibitorStackSlugs = (
  categories: ParticipantCategory[]
): string[] =>
  [...categories]
    .filter((c) => c.slug !== "route")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => c.slug);
