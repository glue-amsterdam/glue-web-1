import { z } from "zod";

// Schema for PlanItemType
export const PlanItemSchema = z.object({
  label: z.string(),
});

export const PlanTypeSchema = z.enum(["free", "member", "participant"]);

// Schema for PlanType
export const PlanSchema = z.object({
  plan_id: z.string().uuid("Invalid UUID format"),
  plan_label: z.string(),
  plan_price: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), { message: "Must be a number" }),
  plan_currency: z.string(),
  currency_logo: z.string(),
  plan_description: z.string(),
  plan_type: PlanTypeSchema,
  plan_items: z
    .array(PlanItemSchema)
    .min(1, "At least one plan item is required"),
  is_participant_enabled: z.boolean(),
  order_by: z.number().int().positive(),
});

// Schema for an array of plans
export const PlansArraySchema = z.object({
  plans: z.array(PlanSchema),
});

// Types inferred from the schemas
export type PlanItemType = z.infer<typeof PlanItemSchema>;
export type PlanType = z.infer<typeof PlanSchema>;
export type PlansArrayType = z.infer<typeof PlansArraySchema>;
export type PlanTypeType = z.infer<typeof PlanTypeSchema>;
