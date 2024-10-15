import { Suspense } from "react";
import Loader from "@/app/components/centered-loader";
import { fetchGlueInternationalContent } from "@/utils/api";
import GlueInternational from "./glue-international";

async function GlueInternationalContent() {
  const content = await fetchGlueInternationalContent();
  return <GlueInternational content={content} />;
}

export default async function GlueInternationalSuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <GlueInternationalContent />
    </Suspense>
  );
}
