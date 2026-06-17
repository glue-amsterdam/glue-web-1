import type {
  ExhibitorItem,
  ExhibitorSortField,
  ExhibitorSortOrder,
} from "./exhibitor-types";

const getDisplayNumberSortKey = (item: ExhibitorItem): string => {
  return item.displayNumber ?? item.hubDisplayNumber ?? "";
};

const parseNumericSortValue = (value: string): number | null => {
  if (value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const compareDisplayNumbers = (a: string, b: string): number => {
  const aNum = parseNumericSortValue(a);
  const bNum = parseNumericSortValue(b);

  if (aNum !== null && bNum !== null) {
    return aNum - bNum;
  }

  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
};

const compareNames = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
};

const isEmptySortKey = (value: string): boolean => value === "";

export const sortExhibitors = (
  items: ExhibitorItem[],
  sort: ExhibitorSortField,
  order: ExhibitorSortOrder
): ExhibitorItem[] => {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name") {
      return compareNames(left.name, right.name);
    }

    const leftKey = getDisplayNumberSortKey(left);
    const rightKey = getDisplayNumberSortKey(right);
    const leftEmpty = isEmptySortKey(leftKey);
    const rightEmpty = isEmptySortKey(rightKey);

    if (leftEmpty && rightEmpty) return 0;
    if (leftEmpty) return 1;
    if (rightEmpty) return -1;

    return compareDisplayNumbers(leftKey, rightKey);
  });

  if (order === "desc") {
    sorted.reverse();
  }

  return sorted;
};
