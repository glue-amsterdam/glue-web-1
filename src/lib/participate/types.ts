export type ParticipatePlanFeature = { label: string };

export type ParticipatePlanCard = {
  is_selectable: boolean;
  id: string;
  plan_label: string;
  plan_price: string;
  features: ParticipatePlanFeature[];
};

export type ParticipatePlansPayload = {
  applicationClosed: boolean;
  closedMessage: string;
  selectablePlans: ParticipatePlanCard[];
};

export type ParticipatePageData = ParticipatePlansPayload & {
  basePackage: ParticipatePlanCard;
};

export type ParticipatePlanDbRow = {
  plan_id: string;
  plan_label: string;
  plan_price: string | number;
  plan_currency: string;
  currency_logo: string;
  plan_items: { label: string }[];
  order_by: number;
};

export type ParticipatePlansStatusRow = {
  application_closed: boolean;
  closed_message: string;
  base_plan_label?: string | null;
  base_plan_subtitle?: string | null;
  base_plan_items?: { label: string }[] | null;
};

export type ParticipateBasePackageAdminData = {
  base_plan_label: string;
  base_plan_subtitle: string;
  base_plan_items: ParticipatePlanFeature[];
};

export type ParticipateApplicationStatusAdminData = {
  application_closed: boolean;
  closed_message: string;
};
