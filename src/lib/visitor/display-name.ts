type VisitorNameRow = {
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
};

export const getVisitorDisplayName = (row: VisitorNameRow): string => {
  const generated = row.display_name?.trim();
  if (generated) return generated;

  const fromParts = [row.first_name, row.last_name]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ");
  if (fromParts) return fromParts;

  return row.full_name?.trim() || "";
};
