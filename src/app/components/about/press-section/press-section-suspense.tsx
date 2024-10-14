import { Suspense } from "react";
import Loader from "@/app/components/centered-loader";
import { fetchPressItems } from "@/utils/api";
import PressSection from "./press-section";

async function PressSectionContent() {
  const pressItems = await fetchPressItems();
  return <PressSection pressItems={pressItems} />;
}

export default async function PressSectionSuspense() {
  return (
    <section
      className="mb-12 container mx-auto px-4"
      aria-labelledby="press-heading"
    >
      <Suspense fallback={<Loader />}>
        <PressSectionContent />
      </Suspense>
    </section>
  );
}
