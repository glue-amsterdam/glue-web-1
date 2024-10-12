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
import { motion } from "framer-motion";

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

  const InfoCard = ({ info, i }: { info: InfoItem; i: number }) => {
    const yOffset = i % 2 === 1 ? -150 : 150;

    return (
      <motion.div
        initial={{ y: yOffset, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: i * 0.2 }}
        viewport={{ once: true }}
        className="relative"
      >
        <Card
          className="cursor-pointer rounded-none border-none group"
          onClick={() => openModal(info)}
        >
          <CardContent className="p-0">
            <div className="relative w-full h-[20vh] md:h-[50vh] lg:h-[60vh] overflow-hidden transition-all">
              <img
                src={info.image}
                alt={info.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105"
              />
              <div className="absolute bg-black/50 w-full text-white py-4 duration-300 group-hover:py-12 transition-all">
                <h3 className="font-bold text-lg mb-2">{info.title}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <section aria-labelledby="info-heading" className="space-y-4 mt-[15vh]">
      <motion.h2
        id="info-heading"
        className="text-5xl md:text-7xl uppercase tracking-widest font-bold "
        initial={{ opacity: 0, x: 70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
      >
        Information
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {infoItems.map((info, index) => (
          <InfoCard key={info.id} i={index} info={info} />
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
    </section>
  );
}
