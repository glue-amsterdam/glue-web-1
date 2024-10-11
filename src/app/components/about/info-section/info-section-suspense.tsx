import { Suspense } from "react";
import Loader from "@/app/components/loader";
import { fetchInfoItems } from "@/utils/api";
import InfoSection from "./info-section";

async function InfoSectionContent() {
  const infoItems = await fetchInfoItems();
  return <InfoSection infoItems={infoItems} />;
}

export default async function InfoSectionSuspense() {
  return (
    <section
      className="mb-12 container mx-auto px-4"
      aria-labelledby="info-heading"
    >
      <Suspense fallback={<Loader />}>
        <InfoSectionContent />
      </Suspense>
    </section>
  );
}
