import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";

export type AdminEntityType = "participant" | "visitor";

export type AdminUserListItem = {
  userId: string;
  entityType: AdminEntityType;
  displayName: string;
  email: string | null;
  createdAt: string | null;
  isMod: boolean;
  participantSlug?: string;
  participantStatus?: string;
  participantIsSticky?: boolean;
  participantIsActive?: boolean;
  participantSpecialProgram?: boolean;
  participantReactivationRequested?: boolean;
  participantReactivationStatus?: string | null;
};

export type AdminVisitorData = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  display_name: string | null;
  birth_date: string | null;
  area_id: string | null;
};

export type AdminUserDetail = {
  userId: string;
  entityType: AdminEntityType;
  displayName: string;
  email: string | null;
  isMod: boolean;
  createdAt: string | null;
  visitorData?: AdminVisitorData;
  participantDetails?: ParticipantDetails;
  invoiceData?: {
    invoice_company_name: string;
    invoice_zip_code: string;
    invoice_address: string;
    invoice_country: string;
    invoice_city: string;
    invoice_extra?: string | null;
  };
  visitingHours?: Array<{
    day_id: string;
    hours: Array<{ open: string; close: string }>;
  }>;
};
