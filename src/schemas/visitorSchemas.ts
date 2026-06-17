import { z } from "zod";
import {
  isVisitorAgeRange,
  VISITOR_AGE_RANGES,
} from "@/lib/visitor/visitor-age-ranges";

const visitorAgeRangeSchema = z.enum(VISITOR_AGE_RANGES, {
  message: "Age range is required",
});

const visitorAreaIdSchema = z
  .string()
  .uuid("Work area is required");

export const visitorRegisterSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(200),
  lastName: z.string().trim().min(1, "Last name is required").max(200),
  email: z.string().trim().email("Invalid email address").max(320),
  password: z.string().min(8, "Password must be at least 8 characters"),
  birthDate: visitorAgeRangeSchema,
  areaId: visitorAreaIdSchema,
  newsletterSubscribe: z.boolean(),
});

export type VisitorRegisterInput = z.infer<typeof visitorRegisterSchema>;

export const visitorParticipantAccountSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(200),
  lastName: z.string().trim().min(1, "Last name is required").max(200),
  email: z.string().trim().email("Invalid email address").max(320),
  password: z.string().min(8, "Password must be at least 8 characters"),
  newsletterSubscribe: z.boolean(),
});

export type VisitorParticipantAccountValues = z.infer<
  typeof visitorParticipantAccountSchema
>;

export const visitorProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(200),
  lastName: z.string().trim().min(1, "Last name is required").max(200),
  email: z.string().trim().email("Invalid email address").max(320),
  birthDate: visitorAgeRangeSchema,
  areaId: visitorAreaIdSchema,
});

export type VisitorProfileInput = z.infer<typeof visitorProfileSchema>;

export const visitorCheckInFieldsSchema = z.object({
  birthDate: visitorAgeRangeSchema,
  areaId: visitorAreaIdSchema,
});

export type VisitorCheckInFieldsInput = z.infer<typeof visitorCheckInFieldsSchema>;

/** Form state before validation (allows empty selects). */
export type VisitorProfileFormState = Omit<
  VisitorProfileInput,
  "birthDate" | "areaId"
> & {
  birthDate: string;
  areaId: string;
};

/** API GET shape (lenient read — submit still uses visitorProfileSchema). */
export const visitorProfileApiSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  birthDate: z.string().optional(),
  areaId: z.string().optional(),
  displayName: z.string().optional(),
});

export type VisitorProfileApi = z.infer<typeof visitorProfileApiSchema>;

export const visitorProfileResponseSchema = z.object({
  profile: visitorProfileApiSchema,
});

export const toVisitorProfileFormValues = (
  profile: VisitorProfileApi
): VisitorProfileFormState => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  birthDate: (() => {
    const raw = profile.birthDate ?? "";
    return isVisitorAgeRange(raw) ? raw : "";
  })(),
  areaId: profile.areaId?.trim() ?? "",
});
