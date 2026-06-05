type VisitorNameRow = {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  email?: string | null;
  birth_date?: string | null;
  area_id?: string | null;
  id: string;
};

const splitFullName = (name: string): { firstName: string; lastName: string } => {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};

export const resolveVisitorNameFields = (row: VisitorNameRow) => {
  let firstName = row.first_name?.trim() ?? "";
  let lastName = row.last_name?.trim() ?? "";

  if (!firstName && !lastName) {
    const source =
      row.display_name?.trim() || row.full_name?.trim() || "";
    if (source) {
      const split = splitFullName(source);
      firstName = split.firstName;
      lastName = split.lastName;
    }
  } else if (!lastName && row.full_name?.trim()) {
    const split = splitFullName(row.full_name.trim());
    if (!firstName) firstName = split.firstName;
    if (!lastName) lastName = split.lastName;
  }

  return { firstName, lastName };
};

export const mapVisitorRowToProfileResponse = (
  row: VisitorNameRow,
  fallbackEmail?: string | null
) => {
  const { firstName, lastName } = resolveVisitorNameFields(row);
  const email =
    row.email?.trim() || fallbackEmail?.trim() || "";

  return {
    id: row.id,
    firstName,
    lastName,
    email,
    birthDate: row.birth_date ? String(row.birth_date).slice(0, 10) : "",
    areaId: row.area_id ?? "",
  };
};
