import type { ParticipationActor } from "@/lib/participate/get-participation-form-context";
import { getDashboardHomePath } from "@/lib/users/get-dashboard-home-path";
import type { ParticipationIntent } from "@/schemas/participationSchemas";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";

export type ParticipantStatus = "pending" | "accepted" | "declined" | null;

export type ParticipationEligibility = {
  actor: ParticipationActor;
  isAuthenticated: boolean;
  userId: string | null;
  isParticipant: boolean;
  is_active: boolean;
  status: ParticipantStatus;
  reactivation_status: "pending" | "approved" | "declined" | null;
  requestedIntent: ParticipationIntent;
  resolvedIntent: ParticipationIntent;
  canSelectPlan: boolean;
  canApply: boolean;
  blockReason?: string;
  participateBackHref: string;
  dashboardHref: string | null;
};

const PLANS_SECTION_HASH = "#plans-selection-section";

const parseRequestedIntent = (intentParam?: string): ParticipationIntent => {
  if (intentParam === "upgrade" || intentParam === "reactivation") {
    return intentParam;
  }
  return "new";
};

const buildParticipateHref = (intent: ParticipationIntent): string => {
  if (intent === "new") {
    return `/participate${PLANS_SECTION_HASH}`;
  }
  return `/participate?intent=${intent}${PLANS_SECTION_HASH}`;
};

const resolveIntent = ({
  requestedIntent,
  isParticipant,
  is_active,
  status,
}: {
  requestedIntent: ParticipationIntent;
  isParticipant: boolean;
  is_active: boolean;
  status: ParticipantStatus;
}): ParticipationIntent => {
  if (!isParticipant || status === "declined") {
    return "new";
  }

  if (status === "pending") {
    return requestedIntent;
  }

  if (!is_active) {
    return "reactivation";
  }

  if (requestedIntent === "upgrade") {
    return "upgrade";
  }

  return "new";
};

const evaluateEligibility = ({
  actor,
  isAuthenticated,
  userId,
  isParticipant,
  is_active,
  status,
  reactivation_status,
  requestedIntent,
  resolvedIntent,
}: {
  actor: ParticipationActor;
  isAuthenticated: boolean;
  userId: string | null;
  isParticipant: boolean;
  is_active: boolean;
  status: ParticipantStatus;
  reactivation_status: "pending" | "approved" | "declined" | null;
  requestedIntent: ParticipationIntent;
  resolvedIntent: ParticipationIntent;
}): Pick<
  ParticipationEligibility,
  "canSelectPlan" | "canApply" | "blockReason" | "participateBackHref" | "dashboardHref"
> => {
  const dashboardHref =
    isAuthenticated && userId
      ? getDashboardHomePath(userId, {
          isParticipant,
          isPendingParticipant: status === "pending",
        })
      : null;

  if (!isAuthenticated) {
    return {
      canSelectPlan: true,
      canApply: true,
      participateBackHref: buildParticipateHref("new"),
      dashboardHref: null,
    };
  }

  if (isParticipant && status === "pending") {
    return {
      canSelectPlan: false,
      canApply: false,
      blockReason:
        "Your participant application is under review. You will be notified once it has been processed.",
      participateBackHref: buildParticipateHref(resolvedIntent),
      dashboardHref,
    };
  }

  if (isParticipant && is_active && resolvedIntent !== "upgrade") {
    return {
      canSelectPlan: false,
      canApply: false,
      blockReason:
        "You are already an active participant. Manage your profile from the dashboard.",
      participateBackHref: buildParticipateHref(resolvedIntent),
      dashboardHref,
    };
  }

  if (isParticipant && !is_active) {
    if (reactivation_status === "pending") {
      return {
        canSelectPlan: false,
        canApply: false,
        blockReason:
          "Your reactivation request is already pending review by administrators.",
        participateBackHref: buildParticipateHref("reactivation"),
        dashboardHref,
      };
    }

    return {
      canSelectPlan: true,
      canApply: true,
      participateBackHref: buildParticipateHref("reactivation"),
      dashboardHref,
    };
  }

  if (resolvedIntent === "upgrade") {
    return {
      canSelectPlan: true,
      canApply: true,
      participateBackHref: buildParticipateHref("upgrade"),
      dashboardHref,
    };
  }

  return {
    canSelectPlan: true,
    canApply: true,
    participateBackHref: buildParticipateHref(resolvedIntent),
    dashboardHref,
  };
};

export const getParticipationEligibility = async (
  intentParam?: string
): Promise<ParticipationEligibility> => {
  const requestedIntent = parseRequestedIntent(intentParam?.trim());
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      actor: "guest",
      isAuthenticated: false,
      userId: null,
      isParticipant: false,
      is_active: false,
      status: null,
      reactivation_status: null,
      requestedIntent,
      resolvedIntent: "new",
      canSelectPlan: true,
      canApply: true,
      participateBackHref: buildParticipateHref("new"),
      dashboardHref: null,
    };
  }

  const admin = await createAdminClient();
  const [visitorRowRes, participantDetailsRes, loggedUserInfoRes] =
    await Promise.all([
      admin
        .from("visitor_data")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
      supabase
        .from("participant_details")
        .select("status, is_active, reactivation_status")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_info")
        .select("plan_type")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  const hasParticipantRow = Boolean(participantDetailsRes.data);
  const isLegacyParticipant =
    loggedUserInfoRes.data?.plan_type === "participant";
  const isParticipant = hasParticipantRow || isLegacyParticipant;
  const hasVisitorRow = Boolean(visitorRowRes.data);

  const actor: ParticipationActor = isParticipant
    ? "participant"
    : hasVisitorRow
      ? "visitor"
      : "visitor";

  const status = (participantDetailsRes.data?.status ?? null) as ParticipantStatus;
  const is_active = participantDetailsRes.data?.is_active ?? false;
  const reactivation_status =
    (participantDetailsRes.data?.reactivation_status ?? null) as
      | "pending"
      | "approved"
      | "declined"
      | null;

  const resolvedIntent = resolveIntent({
    requestedIntent,
    isParticipant,
    is_active,
    status,
  });

  const access = evaluateEligibility({
    actor,
    isAuthenticated: true,
    userId: user.id,
    isParticipant,
    is_active,
    status,
    reactivation_status,
    requestedIntent,
    resolvedIntent,
  });

  return {
    actor,
    isAuthenticated: true,
    userId: user.id,
    isParticipant,
    is_active,
    status,
    reactivation_status,
    requestedIntent,
    resolvedIntent,
    ...access,
  };
};
