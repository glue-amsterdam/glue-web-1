import Background from "@/app/components/background";
import CenteredLoader from "@/app/components/centered-loader";
import EventsPageContainer from "@/app/events/events-page-container";
import { NAVBAR_HEIGHT } from "@/constants";
import { Suspense } from "react";

export default async function EventsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.append(key, value.toLowerCase());
    }
  });

  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`min-h-dvh relative overflow-hidden`}
    >
      <Background />
      <Suspense fallback={<CenteredLoader />}>
        <EventsPageContainer params={params} />
      </Suspense>
    </div>
  );
}
