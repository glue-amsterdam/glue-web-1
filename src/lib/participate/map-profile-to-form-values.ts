import type { InvoiceFormData } from "@/app/signup-0.1/InvoiceFormData";
import type { ParticipantExtraDataFormData } from "@/schemas/participantExtraDataSchema";
import type { InvoiceData } from "@/schemas/invoiceSchemas";
import type { MapInfo } from "@/schemas/mapInfoSchemas";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { participantExtraDataSchema } from "@/schemas/participantExtraDataSchema";
import { invoiceDataTypeSchema } from "@/schemas/invoiceSchemas";
import { mapInfoSchema } from "@/schemas/mapInfoSchemas";

export type SectionStatus = "empty" | "complete";

export const mapInvoiceRowToFormValues = (
  row: InvoiceData | null | undefined
): InvoiceFormData | null => {
  if (!row) return null;

  const candidate = {
    invoice_company_name: row.invoice_company_name ?? "",
    invoice_zip_code: row.invoice_zip_code ?? "",
    invoice_address: row.invoice_address ?? "",
    invoice_country: row.invoice_country ?? "",
    invoice_city: row.invoice_city ?? "",
    invoice_extra: row.invoice_extra ?? null,
  };

  const parsed = invoiceDataTypeSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
};

export const mapParticipantDetailsToExtraFormValues = (
  row: ParticipantDetails | null | undefined
): ParticipantExtraDataFormData | null => {
  if (!row) return null;

  const candidate = {
    short_description: row.short_description ?? "",
    phone_numbers: row.phone_numbers ?? [],
    visible_emails: row.visible_emails ?? [],
    glue_communication_email: row.glue_communication_email ?? "",
    visible_websites: row.visible_websites ?? [],
    social_media: row.social_media ?? {},
  };

  const parsed = participantExtraDataSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
};

export const mapMapInfoRowToFormValues = (
  row: Record<string, unknown> | null | undefined
): MapInfo | null => {
  if (!row) return null;

  const candidate = {
    user_id: typeof row.user_id === "string" ? row.user_id : undefined,
    formatted_address:
      typeof row.formatted_address === "string" ? row.formatted_address : null,
    latitude: typeof row.latitude === "number" ? row.latitude : null,
    longitude: typeof row.longitude === "number" ? row.longitude : null,
    no_address: Boolean(row.no_address),
    exhibition_space_preference:
      typeof row.exhibition_space_preference === "string"
        ? row.exhibition_space_preference
        : null,
  };

  const parsed = mapInfoSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
};

export const getInvoiceSectionStatus = (
  values: InvoiceFormData | null
): SectionStatus => (values ? "complete" : "empty");

export const getExtraSectionStatus = (
  values: ParticipantExtraDataFormData | null
): SectionStatus => (values ? "complete" : "empty");

export const getMapSectionStatus = (values: MapInfo | null): SectionStatus => {
  if (!values) return "empty";
  if (values.no_address) return "complete";
  if (values.formatted_address && values.latitude != null && values.longitude != null) {
    return "complete";
  }
  return "empty";
};
