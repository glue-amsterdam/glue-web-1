"use client";

import SponsorModal from "@/app/admin/components/sponsors-form/sponsors-modal";
import { SponsorsTable } from "@/app/admin/components/sponsors-form/sponsors-table";
import SponsorForm from "@/app/admin/forms/about-sponsors-form";
import SponsorsHeaderForm from "@/app/admin/forms/about-sponsors-header-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Sponsor, SponsorsHeader } from "@/schemas/sponsorsSchema";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutSponsorsSection() {
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const { data: sponsorsHeaderData, error: sponsorsHeaderError } =
    useSWR<SponsorsHeader>("/api/admin/about/sponsors/header", fetcher);

  const { data: sponsorsData, error: sponsorsError } = useSWR<Sponsor[]>(
    "/api/admin/about/sponsors",
    fetcher
  );

  if (sponsorsHeaderError || sponsorsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!sponsorsHeaderData || !sponsorsData) {
    return <Skeleton className="w-full h-[200px]" />;
  }
  const handleSponsorUpdate = () => {
    mutate("/api/admin/about/sponsors");
    setSelectedSponsor(null);
  };

  return (
    <div className="space-y-8">
      <SponsorsHeaderForm initialData={sponsorsHeaderData} />
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Sponsors</h3>
        <SponsorsTable
          sponsors={sponsorsData}
          mutate={() => mutate("/api/admin/about/sponsors")}
        />
      </div>
      <div className="flex justify-center flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Add Sponsor</h2>
        <SponsorForm
          sponsorTypes={sponsorsHeaderData.sponsors_types}
          onSponsorAdded={handleSponsorUpdate}
        />
      </div>

      {selectedSponsor && (
        <SponsorModal
          sponsor={selectedSponsor}
          sponsorTypes={sponsorsHeaderData.sponsors_types}
          onClose={() => setSelectedSponsor(null)}
          onSponsorUpdated={handleSponsorUpdate}
        />
      )}
    </div>
  );
}
