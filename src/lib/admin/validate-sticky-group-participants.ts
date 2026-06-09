import type { SupabaseClient } from "@supabase/supabase-js";
import type { StickyGroupMemberInput } from "@/types/sticky-member";
import { validateStickyGroupMembers } from "@/lib/admin/sticky-group-members";

type LegacyParticipantInput = {
  user_id?: string;
  display_name_only?: string;
  is_curated?: boolean;
};

export const validateStickyGroupParticipants = async (
  supabase: SupabaseClient,
  participants: LegacyParticipantInput[] | undefined
): Promise<{ valid: true } | { valid: false; invalidUserIds: string[] }> => {
  const members: StickyGroupMemberInput[] = (participants ?? []).map(
    (participant) => ({
      user_id: participant.user_id,
      display_name_only: participant.display_name_only,
      is_curated: participant.is_curated,
    })
  );

  const validation = await validateStickyGroupMembers(supabase, members);

  if (validation.valid) {
    return { valid: true };
  }

  return {
    valid: false,
    invalidUserIds: validation.invalidUserIds,
  };
};
