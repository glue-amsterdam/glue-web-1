import type { SignupSource } from "@/lib/auth/post-auth-redirect";
import type { TextSectionSlug } from "@/schemas/textSectionSchema";

export const resolveSignUpIntroSlug = (
  source: SignupSource | null
): TextSectionSlug =>
  source === "restricted"
    ? "sign-up-intro-restricted"
    : "sign-up-intro-visitor";
