"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfoItem } from "@/utils/about-types";

interface InfoSectionProps {
  infoItems: InfoItem[];
}

export default function InfoSection({ infoItems }: InfoSectionProps) {
  const [selectedInfo, setSelectedInfo] = useState<InfoItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (info: InfoItem) => {
    setSelectedInfo(info);
    setModalOpen(true);
  };

  const InfoCard = ({ info }: { info: InfoItem }) => (
    <Card className="cursor-pointer" onClick={() => openModal(info)}>
      <CardContent className="p-0">
        <div className="relative w-full h-40">
          <img
            src={info.image}
            alt={info.title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{info.title}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {info.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h2 id="info-heading" className="text-3xl font-bold mb-6">
        Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {infoItems.map((info) => (
          <InfoCard key={info.id} info={info} />
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>{selectedInfo?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {selectedInfo && (
              <div className="relative w-full h-[300px]">
                <img
                  src={selectedInfo.image}
                  alt={selectedInfo.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg mb-4"
                />
              </div>
            )}
            <p>{selectedInfo?.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
