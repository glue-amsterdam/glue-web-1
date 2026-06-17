import { z } from "zod";
import { PlanItemSchema } from "@/schemas/plansSchema";

export const participateBasePackageUpdateSchema = z.object({
  base_plan_label: z.string().min(1),
  base_plan_subtitle: z.string().min(1),
  base_plan_items: z
    .array(PlanItemSchema)
    .min(1, "At least one feature is required"),
});

export const participateApplicationStatusUpdateSchema = z.object({
  application_closed: z.boolean(),
  closed_message: z.string(),
});

export type ParticipateBasePackageUpdate = z.infer<
  typeof participateBasePackageUpdateSchema
>;
export type ParticipateApplicationStatusUpdate = z.infer<
  typeof participateApplicationStatusUpdateSchema
>;
