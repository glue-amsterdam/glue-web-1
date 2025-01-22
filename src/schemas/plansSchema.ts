import { z } from "zod";

// Schema for PlanItemType
export const PlanItemSchema = z.object({
  label: z.string(),
});

// Schema for PlanIdType
export const PlanIdSchema = z.string().refine(
  (val) => {
    return val === "planId-0" || val === "planId-1" || /^planId-\d+$/.test(val);
  },
  {
    message:
      "Plan ID must be 'planId-0', 'planId-1', or 'planId-' followed by a number",
  }
);

export const PlanTypeSchema = z.enum(["free", "member", "participant"]);

// Schema for PlanType
export const PlanSchema = z.object({
  plan_id: PlanIdSchema,
  plan_label: z.string(),
  plan_price: z.string(),
  plan_currency: z.string(),
  currency_logo: z.string(),
  plan_description: z.string(),
  plan_type: PlanTypeSchema,
  plan_items: z
    .array(PlanItemSchema)
    .min(1, "At least one plan item is required"),
  is_participant_enabled: z.boolean(),
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
export type PlanTypeType = z.infer<typeof PlanTypeSchema>;
