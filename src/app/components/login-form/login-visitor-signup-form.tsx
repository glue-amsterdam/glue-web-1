"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useSignUpHref } from "@/components/sign-up/sign-up-nav-link";

type LoginVisitorSignupFormProps = {
  isOpen: boolean;
};

const LoginVisitorSignupFormContent = ({
  isOpen,
}: LoginVisitorSignupFormProps) => {
  const signUpHref = useSignUpHref();

  if (!isOpen) return null;

  return (
    <div
      className="rounded-lg border border-primary/20 bg-white/80 p-4 shadow-sm"
      role="region"
      aria-labelledby="login-visitor-signup-heading"
    >
      <p
        id="login-visitor-signup-heading"
        className="text-center text-sm font-medium text-foreground"
      >
        New here?
      </p>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Create a visitor account with email and password.
      </p>
      <div className="mt-4 flex justify-center">
        <Button asChild className="w-full hover:bg-[var(--color-box2)]">
          <Link href={signUpHref}>Register</Link>
        </Button>
      </div>
    </div>
  );
};

export const LoginVisitorSignupForm = ({
  isOpen,
}: LoginVisitorSignupFormProps) => {
  if (!isOpen) return null;

  return (
    <Suspense fallback={null}>
      <LoginVisitorSignupFormContent isOpen={isOpen} />
    </Suspense>
  );
};
