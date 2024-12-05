import { imageDataSchema } from "@/schemas/baseSchema";
import { z } from "zod";

const baseUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  user_name: z.string().optional(),
  plan_id: z.string(),
  plan_type: z.enum(["free", "member", "participant"]),
  phone_numbers: z.array(z.string()).optional(),
  social_media: z
    .object({
      instagramLink: z.string().optional(),
      facebookLink: z.string().optional(),
      linkedinLink: z.string().optional(),
    })
    .optional(),
  visible_emails: z.array(z.string()).optional(),
  visible_websites: z.array(z.string()).optional(),
});

const invoiceSchema = z.object({
  invoice_company_name: z.string().min(3),
  invoice_zip_code: z.string().min(5),
  invoice_address: z.string().min(3),
  invoice_country: z.string().min(3),
  invoice_city: z.string().min(3),
  invoice_extra: z.string().optional(),
});

const participantSchema = z.object({
  short_description: z.string().min(1).max(500),
  description: z.string().optional(),
  slug: z.string().optional(),
  is_sticky: z.boolean().optional(),
  year: z.number().optional(),
  status: z.string().optional(),
  images: z.array(imageDataSchema).optional(),
});

export type ParticipantAuthData = z.infer<typeof participantSchema>;

const mapInfoSchema = z.object({
  formatted_address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  no_address: z.boolean(),
});

export const userSchema = z.discriminatedUnion("plan_type", [
  baseUserSchema.extend({ plan_type: z.literal("free") }),
  baseUserSchema
    .extend({ plan_type: z.literal("member") })
    .merge(invoiceSchema),
  baseUserSchema
    .extend({ plan_type: z.literal("participant") })
    .merge(invoiceSchema)
    .merge(participantSchema)
    .merge(mapInfoSchema),
]);

export type UserData = z.infer<typeof userSchema>;
