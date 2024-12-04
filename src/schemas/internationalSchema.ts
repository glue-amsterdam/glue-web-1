import { z } from "zod";

export type GlueInternationalContent = z.infer<
  typeof glueInternationalSectionSchema
>;
export type GlueInternationalButtonColor = z.infer<
  typeof glueInternationalButtonColorSchema
>;

export const glueInternationalButtonColorSchema = z.object({
  buttonColor: z
    .string()
    .min(1, "Button color is required")
    .regex(
      /^#(?:[0-9a-fA-F]{3}){1,2}$/,
      "Button color must be a valid hex code"
    ),
});

export const glueInternationalSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  buttonText: z.string().min(1, "Button text is required"),
  website: z.string().url("Invalid website URL"),
  buttonColor: glueInternationalButtonColorSchema,
});
