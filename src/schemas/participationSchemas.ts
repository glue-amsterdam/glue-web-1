import { z } from "zod";
import { invoiceDataTypeSchema } from "@/schemas/invoiceSchemas";
import { mapInfoSchema } from "@/schemas/mapInfoSchemas";
import { participantExtraDataSchema } from "@/schemas/participantExtraDataSchema";
import { visitorParticipantAccountSchema } from "@/schemas/visitorSchemas";
import { reactivationRequestSubmissionSchema } from "@/schemas/participantDetailsSchemas";

export const participationIntentSchema = z.enum([
  "new",
  "upgrade",
  "reactivation",
]);

const termsAcceptedSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the General terms and conditions",
  }),
});

export const participantApplicationSchema = z
  .object({
    intent: participationIntentSchema,
    plan_id: z.string().uuid(),
    plan_type: z.string().min(1).optional(),
    plan_label: z.string().optional(),
  })
  .merge(invoiceDataTypeSchema)
  .merge(participantExtraDataSchema)
  .merge(mapInfoSchema)
  .merge(termsAcceptedSchema);

export const participantApplicationWithAccountSchema =
  participantApplicationSchema.merge(visitorParticipantAccountSchema);

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
