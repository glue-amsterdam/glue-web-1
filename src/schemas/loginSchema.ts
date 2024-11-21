import { z } from "zod";

export const loginSchemaWithName = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const loginSchemaWithEmail = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type FormDataWithEmail = z.infer<typeof loginSchemaWithEmail>;
export type FormDataWithName = z.infer<typeof loginSchemaWithName>;
