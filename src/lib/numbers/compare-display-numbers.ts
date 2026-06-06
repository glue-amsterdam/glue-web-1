const parseNumericSortValue = (value: string): number | null => {
  if (value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const compareDisplayNumbers = (a: string, b: string): number => {
  const aNum = parseNumericSortValue(a);
  const bNum = parseNumericSortValue(b);

  if (aNum !== null && bNum !== null) {
    return aNum - bNum;
  }

  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
};

export const sortByDisplayNumber = <T>(
  items: T[],
  getDisplayNumber: (item: T) => string | null
): T[] => {
  return [...items].sort((left, right) => {
    const leftKey = getDisplayNumber(left)?.trim() ?? "";
    const rightKey = getDisplayNumber(right)?.trim() ?? "";

    if (leftKey === "" && rightKey === "") return 0;
    if (leftKey === "") return 1;
    if (rightKey === "") return -1;

    return compareDisplayNumbers(leftKey, rightKey);
  });
};
