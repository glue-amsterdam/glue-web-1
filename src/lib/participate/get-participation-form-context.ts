import type { InvoiceDataType } from "@/schemas/invoiceSchemas";
import type { ParticipantExtraDataFormData } from "@/schemas/participantExtraDataSchema";
import type { MapInfo } from "@/schemas/mapInfoSchemas";
import type { ParticipationIntent } from "@/schemas/participationSchemas";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import {
  getExtraSectionStatus,
  getInvoiceSectionStatus,
  getMapSectionStatus,
  mapInvoiceRowToFormValues,
  mapMapInfoRowToFormValues,
  mapParticipantDetailsToExtraFormValues,
  type SectionStatus,
} from "@/lib/participate/map-profile-to-form-values";

export type ParticipationActor = "guest" | "visitor" | "participant";

export type ParticipationFormContext = {
  actor: ParticipationActor;
  intent: ParticipationIntent;
  isAuthenticated: boolean;
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
      initialValues: { invoice: null, extra: null, map: null },
      sectionStatus: { invoice: "empty", extra: "empty", map: "empty" },
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
  const hasVisitorRow = Boolean(visitorRowRes.data);

  const actor: ParticipationActor = isParticipant
    ? "participant"
    : hasVisitorRow
      ? "visitor"
      : "visitor";

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
    initialValues: { invoice, extra, map },
    sectionStatus: {
      invoice: getInvoiceSectionStatus(invoice),
      extra: getExtraSectionStatus(extra),
      map: getMapSectionStatus(map),
    },
  };
};
