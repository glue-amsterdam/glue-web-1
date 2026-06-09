import { z } from "zod";
import { invoiceDataTypeSchema } from "@/schemas/invoiceSchemas";
import { mapInfoSchema } from "@/schemas/mapInfoSchemas";
import { participantExtraDataSchema } from "@/schemas/participantExtraDataSchema";
import { visitorRegisterSchema } from "@/schemas/visitorSchemas";
import { reactivationRequestSubmissionSchema } from "@/schemas/participantDetailsSchemas";

export const participationIntentSchema = z.enum([
  "new",
  "upgrade",
  "reactivation",
]);

export const participantApplicationSchema = z
  .object({
    intent: participationIntentSchema,
    plan_id: z.string().uuid(),
    plan_type: z.string().min(1).optional(),
    plan_label: z.string().optional(),
  })
  .merge(invoiceDataTypeSchema)
  .merge(participantExtraDataSchema)
  .merge(mapInfoSchema);

export const participantApplicationWithAccountSchema =
  participantApplicationSchema.merge(visitorRegisterSchema);

export const reactivationFullSubmissionSchema =
  reactivationRequestSubmissionSchema
    .merge(invoiceDataTypeSchema)
    .merge(participantExtraDataSchema);

export const reactivationApplicationSchema = z.object({
  intent: z.literal("reactivation"),
  plan_id: z.string().uuid(),
  reactivation: reactivationFullSubmissionSchema,
});

export type ParticipationIntent = z.infer<typeof participationIntentSchema>;
export type ParticipantApplicationInput = z.infer<
  typeof participantApplicationSchema
>;
export type ParticipantApplicationWithAccountInput = z.infer<
  typeof participantApplicationWithAccountSchema
>;
export type ReactivationApplicationInput = z.infer<
  typeof reactivationApplicationSchema
>;
