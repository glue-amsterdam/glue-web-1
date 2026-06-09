import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";

export const PARTICIPANT_WRITABLE_DETAIL_FIELDS = [
  "short_description",
  "description",
  "slug",
  "display_name",
  "phone_numbers",
  "social_media",
  "visible_emails",
  "visible_websites",
  "glue_communication_email",
] as const;

const MOD_ONLY_DEFAULTS: Pick<
  ParticipantDetails,
  | "plan_id"
  | "plan_type"
  | "special_program"
  | "status"
  | "is_active"
  | "reactivation_requested"
  | "reactivation_notes"
  | "reactivation_status"
  | "display_number"
  | "upgrade_requested"
  | "upgrade_requested_plan_id"
  | "upgrade_requested_plan_type"
  | "upgrade_request_notes"
  | "upgrade_requested_at"
> = {
  plan_id: null,
  plan_type: null,
  special_program: false,
  status: "pending",
  is_active: true,
  reactivation_requested: false,
  reactivation_notes: null,
  reactivation_status: null,
  display_number: null,
  upgrade_requested: false,
  upgrade_requested_plan_id: null,
  upgrade_requested_plan_type: null,
  upgrade_request_notes: null,
  upgrade_requested_at: null,
};

const pickParticipantWritableFields = (
  data: ParticipantDetails
): Partial<ParticipantDetails> => {
  const picked: Partial<ParticipantDetails> = {};

  for (const key of PARTICIPANT_WRITABLE_DETAIL_FIELDS) {
    if (key in data) {
      (picked as Record<string, unknown>)[key] = data[key];
    }
  }

  return picked;
};

export const filterParticipantDetailsPayload = (
  validatedData: ParticipantDetails,
  existing: ParticipantDetails | null,
  isMod: boolean
): ParticipantDetails => {
  if (isMod) {
    return validatedData;
  }

  const writable = pickParticipantWritableFields(validatedData);

  if (existing) {
    return {
      ...existing,
      ...writable,
      user_id: validatedData.user_id,
    };
  }

  return {
    ...validatedData,
    ...writable,
    ...MOD_ONLY_DEFAULTS,
    user_id: validatedData.user_id,
  };
};
