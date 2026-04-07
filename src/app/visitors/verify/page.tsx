import Link from "next/link";
import { config } from "@/env";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorCopy: Record<string, string> = {
  missing: "This link is missing a confirmation token. Use the link from your email or register again.",
  invalid:
    "This confirmation link is invalid, expired, or was already used. If you already confirmed your email, open Events or Home below. Otherwise submit the visitor form again to resend the email.",
  server:
    "Something went wrong on our side. Please try again in a few minutes or register again.",
};

export const metadata = {
  title: "Email confirmation | GLUE",
  description: "Confirm your visitor email address.",
};

export default async function VisitorVerifyHelpPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const message =
    error && errorCopy[error]
      ? errorCopy[error]
      : "Use the link in your confirmation email to verify your address.";

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center text-black">
      <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50/80 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-amber-900">
          {error ? "Could not confirm email" : "Confirm your email"}
        </h1>
        <p className="mt-3 text-sm text-amber-950/80">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          <Link
            href="/events"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to events
          </Link>
          <span className="text-muted-foreground" aria-hidden>
            ·
          </span>
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Home ({config.cityName})
          </Link>
        </div>
      </div>
    </main>
  );
}
