import { z } from "zod";
import { invoiceDataTypeSchema } from "@/schemas/invoiceSchemas";
import { participantExtraDataSchema } from "@/schemas/participantExtraDataSchema";

const emptyToNull = (val: unknown) => (val === "" ? null : val);

const emptyToUndefined = (val: unknown) =>
  val === "" || val === null || val === undefined ? undefined : val;

const optionalUrlField = z.preprocess(
  emptyToUndefined,
  z.string().url().optional()
);

export const participantSocialMediaSchema = z
  .object({
    instagramLink: optionalUrlField,
    facebookLink: optionalUrlField,
    linkedinLink: optionalUrlField,
  })
  .optional()
  .nullable();

export const reactivationNotesSchema = z
  .object({
    plan_id: z.string().optional().nullable(),
    plan_type: z.string().optional().nullable(),
    plan_label: z.string().optional().nullable(),
    formatted_address: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    no_address: z.boolean().optional(),
    notes: z.string().optional().nullable(),
    exhibition_space_preference: z.string().optional().nullable(),
    termsAccepted: z.boolean().optional(),
    short_description: z.string().optional().nullable(),
  })
  .merge(invoiceDataTypeSchema.partial())
  .merge(participantExtraDataSchema.partial());

export type ReactivationNotes = z.infer<typeof reactivationNotesSchema>;

/** Stricter schema for new reactivation request submissions (plan required). */
export const reactivationRequestSubmissionSchema =
  reactivationNotesSchema.extend({
    plan_id: z.string().min(1, "You must select a plan"),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the General terms and conditions",
    }),
  });

export type ReactivationRequestSubmission = z.infer<
  typeof reactivationRequestSubmissionSchema
>;

export const participantDetailsSchema = z.object({
  user_id: z.string().uuid(),
  short_description: z.preprocess(
    emptyToNull,
    z
      .union([
        z.string().max(200, "Short description must be less than 200 characters"),
        z.null(),
      ])
      .optional()
      .nullable()
  ),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .nullable(),
  slug: z.string().min(1, "Slug is required"),
  special_program: z.boolean(),
  status: z.enum(["pending", "accepted", "declined"]),
  is_active: z.boolean(),
  reactivation_requested: z.boolean(),
  reactivation_notes: reactivationNotesSchema.optional().nullable(),
  reactivation_status: z
    .enum(["pending", "approved", "declined"])
    .optional()
    .nullable(),
  display_number: z
    .string()
    .max(10, "Display number must be less than 10 characters")
    .optional()
    .nullable(),
  plan_id: z.string().uuid().optional().nullable(),
  plan_type: z.string().optional().nullable(),
  display_name: z.string().optional().nullable(),
  phone_numbers: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .optional()
    .nullable(),
  social_media: participantSocialMediaSchema,
  visible_emails: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .optional()
    .nullable(),
  visible_websites: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .optional()
    .nullable(),
  glue_communication_email: z.preprocess(
    emptyToNull,
    z.union([z.string().email(), z.null()]).optional().nullable()
  ),
  upgrade_requested: z.boolean().optional(),
  upgrade_requested_plan_id: z.string().uuid().optional().nullable(),
  upgrade_requested_plan_type: z.string().optional().nullable(),
  upgrade_request_notes: z.string().optional().nullable(),
  upgrade_requested_at: z.string().optional().nullable(),
});

export type ParticipantDetailsInput = z.input<typeof participantDetailsSchema>;
export type ParticipantDetails = z.output<typeof participantDetailsSchema>;
