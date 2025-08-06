"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { AlertCircle } from "lucide-react";
import { Sponsor, SponsorsHeader } from "@/schemas/sponsorsSchema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import SponsorForm from "./SponsorForm";
import SponsorModal from "./SponsorModal";
import { SponsorTable } from "./SponsorTable";
import SponsorHeaderForm from "./SponsorHeaderForm";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutSponsorsForm() {
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
      <SponsorHeaderForm initialData={sponsorsHeaderData} />
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Sponsors</h3>
        <SponsorTable
          onEditSponsor={setSelectedSponsor}
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
          key={selectedSponsor.id}
          sponsor={selectedSponsor}
          sponsorTypes={sponsorsHeaderData.sponsors_types}
          onClose={() => setSelectedSponsor(null)}
          onSponsorUpdated={handleSponsorUpdate}
        />
      )}
    </div>
  );
}
