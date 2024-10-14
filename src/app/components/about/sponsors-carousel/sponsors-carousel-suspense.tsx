import { Suspense } from "react";
import Loader from "@/app/components/centered-loader";
import { fetchSponsors } from "@/utils/api";
import SponsorsCarousel from "./sponsors-carousel";

async function SponsorsCarouselContent() {
  const sponsors = await fetchSponsors();
  return <SponsorsCarousel sponsors={sponsors} />;
}

export default async function SponsorsCarouselSuspense() {
  return (
    <section
      className="mb-12 container mx-auto px-4"
      aria-labelledby="sponsors-heading"
    >
      <Suspense fallback={<Loader />}>
        <SponsorsCarouselContent />
      </Suspense>
    </section>
  );
}
