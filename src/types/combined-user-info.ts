import { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { UserInfo } from "@/schemas/userInfoSchemas";

export interface OpenCloseTime {
  open: string;
  close: string;
}

export interface VisitingHours {
  day_id: string;
  hours: OpenCloseTime[];
}

export type CombinedUserInfo = UserInfo & {
  participantDetails?: ParticipantDetails;
  invoiceData?: {
    invoice_company_name: string;
    invoice_zip_code: string;
    invoice_address: string;
    invoice_country: string;
    invoice_city: string;
    invoice_extra?: string | null;
  };
  visitingHours?: VisitingHours;
};
