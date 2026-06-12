export type StickyMember = {
  user_id: string;
  name: string;
  slug: string;
  is_curated: boolean;
};

export type StickyGroupMemberInput = {
  user_id: string;
  is_curated?: boolean;
};

export const getStickyMemberKey = (member: StickyMember) => member.user_id;

export const stickyMemberFromApi = (row: {
  user_id?: string | null;
  name: string;
  slug?: string;
  is_curated: boolean;
}): StickyMember => ({
  user_id: row.user_id ?? "",
  name: row.name,
  slug: row.slug ?? "",
  is_curated: row.is_curated,
});

export const stickyMembersToPayload = (
  members: StickyMember[]
): StickyGroupMemberInput[] =>
  members.map((member) => ({
    user_id: member.user_id,
    is_curated: member.is_curated,
  }));
