import { z } from "zod";
import { invoiceDataTypeSchema } from "@/schemas/invoiceSchemas";
import {
  mapInfoFieldsFromData,
  mapInfoFieldsSchema,
  refineMapInfoLocation,
} from "@/schemas/mapInfoSchemas";
import { participantExtraDataSchema } from "@/schemas/participantExtraDataSchema";
import { visitorParticipantAccountSchema } from "@/schemas/visitorSchemas";
import {
  reactivationRequestSubmissionFieldsSchema,
} from "@/schemas/participantDetailsSchemas";

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

const participantApplicationFieldsSchema = z
  .object({
    intent: participationIntentSchema,
    plan_id: z.string().uuid(),
    plan_type: z.string().min(1).optional(),
    plan_label: z.string().optional(),
  })
  .merge(invoiceDataTypeSchema)
  .merge(participantExtraDataSchema)
  .merge(mapInfoFieldsSchema)
  .merge(termsAcceptedSchema);

export const participantApplicationSchema =
  participantApplicationFieldsSchema.superRefine((data, ctx) =>
    refineMapInfoLocation(mapInfoFieldsFromData(data), ctx)
  );

export const participantApplicationWithAccountSchema =
  participantApplicationFieldsSchema
    .merge(visitorParticipantAccountSchema)
    .superRefine((data, ctx) =>
      refineMapInfoLocation(mapInfoFieldsFromData(data), ctx)
    );

export const reactivationFullSubmissionSchema =
  reactivationRequestSubmissionFieldsSchema
    .merge(invoiceDataTypeSchema)
    .merge(participantExtraDataSchema)
    .superRefine((data, ctx) =>
      refineMapInfoLocation(mapInfoFieldsFromData(data), ctx)
    );

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
