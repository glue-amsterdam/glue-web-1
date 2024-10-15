import { Suspense } from "react";
import Loader from "@/app/components/centered-loader";
import { fetchInfoItems } from "@/utils/api";
import InfoSection from "./info-section";

async function InfoSectionContent() {
  const infoItems = await fetchInfoItems();
  return <InfoSection infoItems={infoItems} />;
}

export default async function InfoSectionSuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <InfoSectionContent />
    </Suspense>
  );
}
