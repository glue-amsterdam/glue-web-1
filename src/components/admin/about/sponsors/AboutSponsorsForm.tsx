"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sponsor, SponsorsHeader } from "@/schemas/sponsorsSchema";
import SponsorForm from "./SponsorForm";
import SponsorModal from "./SponsorModal";
import { SponsorTable } from "./SponsorTable";
import SponsorHeaderForm from "./SponsorHeaderForm";

type AboutSponsorsFormProps = {
  initialHeaderData: SponsorsHeader;
  initialSponsors: Sponsor[];
};

export default function AboutSponsorsForm({
  initialHeaderData,
  initialSponsors,
}: AboutSponsorsFormProps) {
  const router = useRouter();
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  const handleSponsorUpdate = () => {
    setSelectedSponsor(null);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <SponsorHeaderForm initialData={initialHeaderData} />
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Sponsors</h3>
        <SponsorTable
          onEditSponsor={setSelectedSponsor}
          sponsors={initialSponsors}
          onSponsorDeleted={handleSponsorUpdate}
        />
      </div>
      <div className="flex flex-col items-start">
        <h2 className="text-2xl font-bold mb-4">Add Sponsor</h2>
        <SponsorForm
          sponsorTypes={initialHeaderData.sponsors_types}
          onSponsorAdded={handleSponsorUpdate}
        />
      </div>
      {selectedSponsor && (
        <SponsorModal
          key={selectedSponsor.id}
          sponsor={selectedSponsor}
          sponsorTypes={initialHeaderData.sponsors_types}
          onClose={() => setSelectedSponsor(null)}
          onSponsorUpdated={handleSponsorUpdate}
        />
      )}
    </div>
  );
}
