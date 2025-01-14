import { z } from "zod";

// Schema for PlanItemType
export const PlanItemSchema = z.object({
  label: z.string(),
});

// Schema for PlanIdType
export const PlanIdSchema = z.enum([
  "planId-0",
  "planId-1",
  "planId-2",
  "planId-3",
  "planId-4",
  "planId-5",
  "planId-6",
  "planId-7",
]);

export const PlanCurrencyType = z.enum(["free", "member", "participant"]);

// Schema for PlanType
export const PlanSchema = z.object({
  plan_id: PlanIdSchema,
  plan_label: z.string(),
  plan_price: z.string(),
  plan_currency: z.string(),
  currency_logo: z.string(),
  plan_description: z.string(),
  plan_type: PlanCurrencyType,
  plan_items: z
    .array(PlanItemSchema)
    .min(1, "At least one plan item is required"),
});

// Schema for an array of plans
export const PlansArraySchema = z.object({
  plans: z.array(PlanSchema),
});

// Types inferred from the schemas
export type PlanItemType = z.infer<typeof PlanItemSchema>;
export type PlanIdType = z.infer<typeof PlanIdSchema>;
export type PlanType = z.infer<typeof PlanSchema>;
export type PlansArrayType = z.infer<typeof PlansArraySchema>;
export type PlanCurrencyType = z.infer<typeof PlanCurrencyType>;
