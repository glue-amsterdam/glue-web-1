import { z } from "zod";

export const participantDetailsSchema = z
  .object({
    user_id: z.string().uuid(),
    short_description: z
      .string()
      .min(1, "Short description is required")
      .max(200, "Short description must be less than 200 characters"),
    description: z
      .string()
      .max(5000, "Description must be less than 5000 characters")
      .nullable(),
    slug: z.string().min(1, "Slug is required"),
    is_sticky: z.boolean().default(false),
    special_program: z.boolean(),
    year: z.number().nullable().optional(),
    status: z.enum(["pending", "accepted", "declined"]).default("pending"),
  })
  .superRefine((data, ctx) => {
    if (data.is_sticky && (data.year == null || data.year <= 1900)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Year is required and must be greater than 1900 when Is Sticky is true",
        path: ["year"],
      });
    }
  });

export type ParticipantDetails = z.infer<typeof participantDetailsSchema>;
