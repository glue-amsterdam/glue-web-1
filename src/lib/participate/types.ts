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

export type ParticipatePlanDbRow = {
  plan_id: string;
  plan_label: string;
  plan_price: string | number;
  plan_currency: string;
  currency_logo: string;
  plan_items: { label: string }[];
  order_by: number;
};
