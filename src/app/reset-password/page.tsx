import ResetPasswordForm from "@/app/reset-password/reset-password-form";
import { resetPasswordMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = resetPasswordMetadata;

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 text-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl animate-enter-up">
        <h1 className="text-3xl font-bold text-center text-primary">
          Reset Password
        </h1>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
