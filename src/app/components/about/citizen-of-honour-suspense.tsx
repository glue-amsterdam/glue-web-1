import { Suspense } from "react";
import Loader from "@/app/components/loader";
import { fetchCitizensData } from "@/utils/api";
import CitizenOfHonour from "./citizen-of-honour";

async function CitizensOfHonour() {
  const { years, citizens } = await fetchCitizensData();
  return <CitizenOfHonour years={years} initialCitizens={citizens} />;
}

export default async function CitizenOfHonourSuspense() {
  return (
    <section
      className="mb-12 container mx-auto px-4"
      aria-labelledby="citizens-heading"
    >
      <Suspense fallback={<Loader />}>
        <CitizensOfHonour />
      </Suspense>
    </section>
  );
}
