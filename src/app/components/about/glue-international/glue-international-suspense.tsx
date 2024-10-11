import { Suspense } from "react";
import Loader from "@/app/components/loader";
import { fetchGlueInternationalContent } from "@/utils/api";
import GlueInternational from "./glue-international";

async function GlueInternationalContent() {
  const content = await fetchGlueInternationalContent();
  return <GlueInternational content={content} />;
}

export default async function GlueInternationalSuspense() {
  return (
    <section
      className="mb-12 container mx-auto px-4"
      aria-labelledby="glue-international-heading"
    >
      <Suspense fallback={<Loader />}>
        <GlueInternationalContent />
      </Suspense>
    </section>
  );
}
