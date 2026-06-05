import { z } from "zod";

export const visitorRegisterSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(200),
  lastName: z.string().trim().min(1, "Last name is required").max(200),
  email: z.string().trim().email("Invalid email address").max(320),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type VisitorRegisterInput = z.infer<typeof visitorRegisterSchema>;

export const visitorProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(200),
  lastName: z.string().trim().min(1, "Last name is required").max(200),
  email: z.string().trim().email("Invalid email address").max(320),
  birthDate: z.string().trim().optional().or(z.literal("")),
  areaId: z.union([z.string().uuid(), z.literal("")]).optional(),
});

export type VisitorProfileInput = z.infer<typeof visitorProfileSchema>;

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
): VisitorProfileInput => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  birthDate: profile.birthDate ?? "",
  areaId: profile.areaId ?? "",
});
