"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sponsor, SponsorsHeader } from "@/schemas/sponsorsSchema";
import SponsorModal from "./SponsorModal";
import SponsorAddModal from "./SponsorAddModal";
import { SponsorsGroupedList } from "./SponsorsGroupedList";
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
  const [addModalTypeId, setAddModalTypeId] = useState<string | undefined>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSponsorUpdate = () => {
    setSelectedSponsor(null);
    setIsAddModalOpen(false);
    setAddModalTypeId(undefined);
    router.refresh();
  };

  const handleOpenAddModal = (typeId?: string) => {
    setAddModalTypeId(typeId);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <SponsorHeaderForm initialData={initialHeaderData} />

      <section className="rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Partners</h3>
          <p className="text-sm text-muted-foreground">
            Logos and links shown in the site footer, grouped by partner type.
          </p>
        </div>
        <SponsorsGroupedList
          sponsors={initialSponsors}
          sponsorTypes={initialHeaderData.sponsors_types}
          onEditSponsor={setSelectedSponsor}
          onSponsorDeleted={handleSponsorUpdate}
          onAddSponsor={handleOpenAddModal}
        />
      </section>

      {selectedSponsor && (
        <SponsorModal
          key={selectedSponsor.id}
          sponsor={selectedSponsor}
          sponsorTypes={initialHeaderData.sponsors_types}
          onClose={() => setSelectedSponsor(null)}
          onSponsorUpdated={handleSponsorUpdate}
        />
      )}

      {isAddModalOpen && (
        <SponsorAddModal
          sponsorTypes={initialHeaderData.sponsors_types}
          defaultTypeId={addModalTypeId}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddModalTypeId(undefined);
          }}
          onSponsorAdded={handleSponsorUpdate}
        />
      )}
    </div>
  );
}
