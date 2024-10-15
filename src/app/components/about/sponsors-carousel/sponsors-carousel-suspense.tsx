import { Suspense } from "react";
import Loader from "@/app/components/centered-loader";
import { fetchSponsors } from "@/utils/api";
import SponsorsCarousel from "./sponsors-carousel";

async function SponsorsCarouselContent() {
  const sponsors = await fetchSponsors();
  return <SponsorsCarousel sponsors={sponsors} />;
}

export default function SponsorsCarouselSuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <SponsorsCarouselContent />
    </Suspense>
  );
}
