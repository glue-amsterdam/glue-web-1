import Link from "next/link";

type QrCodeErrorProps = {
  userId: string;
  message: string;
};

export const QrCodeError = ({ userId, message }: QrCodeErrorProps) => {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Check-in QR unavailable</h1>
        <p className="text-sm text-white/80">{message}</p>
      </header>
      <Link
        href={`/dashboard/${userId}/visitor-data`}
        className="inline-flex w-fit rounded-full border border-white px-5 py-2 text-sm hover:bg-white/10"
      >
        Complete check-in profile
      </Link>
    </section>
  );
};
