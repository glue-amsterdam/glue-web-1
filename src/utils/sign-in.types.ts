type PlanItemType = {
  id: string;
  plan_id: string;
  label: string;
};

export interface PlansResponse {
  plans: PlanType[];
}

export interface PlanType {
  planId: PlanIdType; // FOREING KEY
  planLabel: string;
  planPrice: string;
  planCurrency: string;
  planDescription: string;
  currencyLogo: string;
  planType: "free" | "member" | "participant";
  planItems: PlanItemType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceData {
  id: string;
  userId: string;
  invoiceData: InvoiceDataType;
  createdAt: Date;
  updatedAt: Date;
}

type PlanIdType =
  | "planId-0"
  | "planId-1"
  | "planId-2"
  | "planId-3"
  | "planId-4"
  | "planId-5";

export interface InvoiceDataType {
  invoiceCompanyName: string;
  invoiceZipCode: string;
  invoiceAddress: string;
  invoiceCountry: string;
  invoiceCity: string;
  invoiceExtra?: string;
}

export interface InvoiceDataCall {
  invoiceId: string /* FOREING KEY */;
  userId: string /* RELACION USER */;
  invoiceData: InvoiceDataType;
  createdAt: Date;
  updatedAt: Date;
}
