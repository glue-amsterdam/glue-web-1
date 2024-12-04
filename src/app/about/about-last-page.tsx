import LastPage from "@/app/components/about/last-page";
import { fetchInternationalContent } from "@/lib/about/fetch-international-section";
import { fetchSponsorsData } from "@/lib/about/fetch-sponsors-section";
import React from "react";

async function AboutLastPage() {
  const glueInternational = await fetchInternationalContent();
  const sponsorsData = await fetchSponsorsData();

  return (
    <LastPage
      glueInternational={glueInternational}
      sponsorsData={sponsorsData}
    />
  );
}

export default AboutLastPage;
