import LastPage from "@/app/components/about/last-page";
import { fetchInternationalContent } from "@/lib/about/fetch-international-section";
import React from "react";

async function AboutLastPage() {
  const glueInternational = await fetchInternationalContent();

  return <LastPage glueInternational={glueInternational} />;
}

export default AboutLastPage;
