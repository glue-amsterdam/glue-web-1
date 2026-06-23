import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import type { AdminUserDetail, AdminVisitorData } from "@/types/admin-user";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import type { AuthUserSummary } from "@/lib/admin/list-all-auth-users";

type BuildAdminUserDetailInput = {
  authUser: AuthUserSummary;
  isMod: boolean;
  visitorData: AdminVisitorData | null;
  participantDetails: ParticipantDetails | null;
  invoiceData?: AdminUserDetail["invoiceData"];
  visitingHours?: AdminUserDetail["visitingHours"];
};

export const buildAdminUserDetail = ({
  authUser,
  isMod,
  visitorData,
  participantDetails,
  invoiceData,
  visitingHours,
}: BuildAdminUserDetailInput): AdminUserDetail => {
  const entityType = participantDetails ? "participant" : "visitor";

  const displayName =
    (participantDetails
      ? getParticipantDisplayName({
          display_name: participantDetails.display_name,
        })
      : "") ||
    (visitorData ? getVisitorDisplayName(visitorData) : "") ||
    authUser.email?.trim() ||
    "Unnamed User";

  const email =
    visitorData?.email?.trim() ||
    participantDetails?.visible_emails?.[0]?.trim() ||
    authUser.email?.trim() ||
    null;

  return {
    userId: authUser.id,
    entityType,
    displayName,
    email,
    isMod,
    createdAt: authUser.created_at ?? null,
    visitorData: visitorData ?? undefined,
    participantDetails: participantDetails ?? undefined,
    invoiceData,
    visitingHours,
  };
};
