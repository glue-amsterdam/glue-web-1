import Link from "next/link";
import { config } from "@/env";

type PageProps = {
  searchParams: Promise<{ already?: string }>;
};

export const metadata = {
  title: "Email confirmed | GLUE",
  description: "Your visitor email has been confirmed.",
};

export default async function VisitorVerifiedPage({ searchParams }: PageProps) {
  const { already } = await searchParams;
  const isRepeat = already === "1";

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center text-black">
      <div className="max-w-md rounded-lg border border-primary/20 bg-uiwhite p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-primary">
          {isRepeat ? "You're already confirmed" : "Email confirmed"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isRepeat
            ? "This visitor profile was already verified. You can keep using the site."
            : "Your email is verified. You can continue exploring GLUE as a visitor."}
        </p>
        <Link
          href="/events"
          className="mt-6 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Go to events
        </Link>
        <span className="mx-2 text-muted-foreground" aria-hidden>
          ·
        </span>
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Home ({config.cityName})
        </Link>
      </div>
    </main>
  );
}
