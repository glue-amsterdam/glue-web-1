import type { AdminUserListItem } from "@/types/admin-user";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import type { AuthUserSummary } from "@/lib/admin/list-all-auth-users";
import type { AdminUserEnrichment } from "@/lib/admin/fetch-admin-user-enrichment";

const resolveDisplayName = (
  authUser: AuthUserSummary,
  enrichment: AdminUserEnrichment
): string => {
  const participant = enrichment.participantByUserId.get(authUser.id);
  const visitor = enrichment.visitorByUserId.get(authUser.id);

  const fromParticipant = participant
    ? getParticipantDisplayName({
        display_name: participant.display_name,
      })
    : "";

  if (fromParticipant && fromParticipant !== "Unknown User") {
    return fromParticipant;
  }

  const fromVisitor = visitor ? getVisitorDisplayName(visitor) : "";
  if (fromVisitor) return fromVisitor;

  if (authUser.email?.trim()) return authUser.email.trim();

  return "Unnamed User";
};

const resolveEmail = (
  authUser: AuthUserSummary,
  enrichment: AdminUserEnrichment
): string | null => {
  const visitor = enrichment.visitorByUserId.get(authUser.id);
  if (visitor?.email?.trim()) return visitor.email.trim();
  if (authUser.email?.trim()) return authUser.email.trim();
  return null;
};

export const buildAdminUserListItem = (
  authUser: AuthUserSummary,
  enrichment: AdminUserEnrichment
): AdminUserListItem => {
  const participant = enrichment.participantByUserId.get(authUser.id);
  const entityType = participant ? "participant" : "visitor";

  const item: AdminUserListItem = {
    userId: authUser.id,
    entityType,
    displayName: resolveDisplayName(authUser, enrichment),
    email: resolveEmail(authUser, enrichment),
    createdAt: authUser.created_at ?? null,
    isMod: enrichment.modByUserId.get(authUser.id) ?? false,
  };

  if (participant) {
    item.participantSlug = participant.slug;
    item.participantStatus = participant.status;
    item.participantIsSticky = enrichment.stickyParticipantIds.has(authUser.id);
    item.participantIsActive = participant.is_active;
    item.participantSpecialProgram = participant.special_program;
    item.participantReactivationRequested = participant.reactivation_requested;
    item.participantReactivationStatus = participant.reactivation_status;
  }

  return item;
};

export const buildAdminUserList = (
  authUsers: AuthUserSummary[],
  enrichment: AdminUserEnrichment
): AdminUserListItem[] =>
  authUsers
    .map((authUser) => buildAdminUserListItem(authUser, enrichment))
    .sort((a, b) =>
      a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: "base",
      })
    );
