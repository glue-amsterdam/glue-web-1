import Background from "@/app/components/background";
import CenteredLoader from "@/app/components/centered-loader";
import EventsPageContainer from "@/app/events/events-page-container";
import { Suspense } from "react";

export default function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.append(key, value.toLowerCase());
    }
  });

  const params = new URLSearchParams();
  return (
    <div className="min-h-screen relative">
      <Suspense fallback={<CenteredLoader />}>
        <EventsPageContainer params={params} />
      </Suspense>
      <Background />
    </div>
  );
}
