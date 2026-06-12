import type { InvoiceDataType } from "@/schemas/invoiceSchemas";
import type { ParticipantExtraDataFormData } from "@/schemas/participantExtraDataSchema";
import type { MapInfo } from "@/schemas/mapInfoSchemas";
import type { ParticipationIntent } from "@/schemas/participationSchemas";
import type { VisitorProfileApi } from "@/schemas/visitorSchemas";
import {
  getExtraSectionStatus,
  getInvoiceSectionStatus,
  getMapSectionStatus,
  mapInvoiceRowToFormValues,
  mapMapInfoRowToFormValues,
  mapParticipantDetailsToExtraFormValues,
  type SectionStatus,
} from "@/lib/participate/map-profile-to-form-values";
import {
  ensureVisitorDataForAuthUser,
  loadVisitorHintsForAuthUser,
} from "@/lib/visitor/ensure-visitor-data";
import { isCheckInProfileComplete } from "@/lib/visitor/is-check-in-profile-complete";
import { mapVisitorRowToProfileResponse } from "@/lib/visitor/map-visitor-row-to-profile";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";

export type ParticipationActor = "guest" | "visitor" | "participant";

export type ParticipationFormContext = {
  actor: ParticipationActor;
  intent: ParticipationIntent;
  isAuthenticated: boolean;
  visitorProfile: VisitorProfileApi | null;
  visitorProfileComplete: boolean;
  initialValues: {
    invoice: InvoiceDataType | null;
    extra: ParticipantExtraDataFormData | null;
    map: MapInfo | null;
  };
  sectionStatus: {
    invoice: SectionStatus;
    extra: SectionStatus;
    map: SectionStatus;
  };
};

export const getParticipationFormContext = async (
  intent: ParticipationIntent
): Promise<ParticipationFormContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      actor: "guest",
      intent,
      isAuthenticated: false,
      visitorProfile: null,
      visitorProfileComplete: false,
      initialValues: { invoice: null, extra: null, map: null },
      sectionStatus: { invoice: "empty", extra: "empty", map: "empty" },
    };
  }

  const admin = await createAdminClient();
  const [participantDetailsRes, loggedUserInfoRes] = await Promise.all([
    supabase
      .from("participant_details")
      .select("*")
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

  const hints = await loadVisitorHintsForAuthUser(user.id, user.email);
  const visitorRow = await ensureVisitorDataForAuthUser(
    user.id,
    hints,
    user.email
  );
  const visitorProfile = mapVisitorRowToProfileResponse(visitorRow, user.email);
  const visitorProfileComplete = isCheckInProfileComplete(visitorProfile);

  const actor: ParticipationActor = isParticipant ? "participant" : "visitor";

  const [invoiceRes, mapRes] = await Promise.all([
    supabase
      .from("invoice_data")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("map_info").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const invoice = mapInvoiceRowToFormValues(invoiceRes.data);
  const extra = mapParticipantDetailsToExtraFormValues(
    participantDetailsRes.data
  );
  const map = mapMapInfoRowToFormValues(mapRes.data);

  return {
    actor,
    intent,
    isAuthenticated: true,
    visitorProfile,
    visitorProfileComplete,
    initialValues: { invoice, extra, map },
    sectionStatus: {
      invoice: getInvoiceSectionStatus(invoice),
      extra: getExtraSectionStatus(extra),
      map: getMapSectionStatus(map),
    },
  };
};
