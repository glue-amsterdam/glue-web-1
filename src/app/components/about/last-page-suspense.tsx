import { fetchGlueInternationalContent, fetchSponsors } from "@/utils/api";
import { Suspense } from "react";
import SponsorsCarousel from "./sponsors-carousel/sponsors-carousel";
import CenteredLoader from "../centered-loader";
import GlueInternational from "./glue-international/glue-international";

async function SponsorsCarouselContent() {
  const sponsors = await fetchSponsors();
  return <SponsorsCarousel sponsors={sponsors} />;
}

async function GlueInternationalContent() {
  const content = await fetchGlueInternationalContent();
  return <GlueInternational content={content} />;
}

export default function LastPageSuspense() {
  return (
    <div className="flex flex-col justify-around h-full">
      <Suspense fallback={<CenteredLoader />}>
        <GlueInternationalContent />
        <SponsorsCarouselContent />
      </Suspense>
    </div>
  );
}
