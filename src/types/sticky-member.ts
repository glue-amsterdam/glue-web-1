export type StickyMemberUser = {
  kind: "user";
  user_id: string;
  name: string;
  slug: string;
  is_curated: boolean;
};

export type StickyMemberDisplayName = {
  kind: "display_name";
  key: string;
  name: string;
  is_curated: boolean;
};

export type StickyMember = StickyMemberUser | StickyMemberDisplayName;

export type StickyGroupMemberInput = {
  user_id?: string;
  display_name_only?: string;
  is_curated?: boolean;
};

export const normalizeStickyDisplayNameKey = (value: string) =>
  value.trim().toLowerCase();

export const getStickyMemberKey = (member: StickyMember) =>
  member.kind === "user" ? member.user_id : member.key;

export const stickyMemberFromApi = (row: {
  kind?: "user" | "display_name";
  user_id?: string | null;
  display_name_only?: string | null;
  name: string;
  slug?: string;
  is_curated: boolean;
}): StickyMember => {
  if (
    row.kind === "display_name" ||
    (!row.user_id && Boolean(row.display_name_only?.trim()))
  ) {
    const name = row.display_name_only?.trim() || row.name.trim();
    return {
      kind: "display_name",
      key: normalizeStickyDisplayNameKey(name),
      name,
      is_curated: row.is_curated,
    };
  }

  return {
    kind: "user",
    user_id: row.user_id ?? "",
    name: row.name,
    slug: row.slug ?? "",
    is_curated: row.is_curated,
  };
};

export const stickyMembersToPayload = (
  members: StickyMember[]
): StickyGroupMemberInput[] =>
  members.map((member) => {
    if (member.kind === "display_name") {
      return {
        display_name_only: member.name,
        is_curated: member.is_curated,
      };
    }

    return {
      user_id: member.user_id,
      is_curated: member.is_curated,
    };
  });
