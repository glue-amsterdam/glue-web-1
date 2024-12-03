"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";
import { fadeInConfig } from "@/utils/animations";
import DOMPurify from "dompurify";
import { InfoItem, InfoItemClient } from "@/schemas/infoSchema";
import Image from "next/image";

interface InfoSectionProps {
  infoItems: InfoItemClient[];
  title: string;
  description: string;
}

export default function InfoSection({
  infoItems,
  title,
  description,
}: InfoSectionProps) {
  const [selectedInfo, setSelectedInfo] = useState<InfoItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const hasAnimatedRef = useRef(false);

  const openModal = (info: InfoItem) => {
    setSelectedInfo(info);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const InfoCard = ({ info, i }: { info: InfoItem; i: number }) => {
    const yOffset = i % 2 === 1 ? -150 : 150;

    return (
      <motion.div
        initial={{
          y: hasAnimatedRef.current ? 0 : yOffset,
          opacity: hasAnimatedRef.current ? 1 : 0,
        }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: i * 0.2 }}
        viewport={{ once: true }}
        className="relative shadow-md overflow-hidden h-full"
        onViewportEnter={() => (hasAnimatedRef.current = true)}
      >
        <Card
          className="cursor-pointer rounded-none border-none group shadow-md h-full"
          onClick={() => openModal(info)}
        >
          <div className="relative w-full h-full">
            <Image
              src={info.image.image_url}
              alt={info.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-uiblack/50 w-full text-uiwhite py-4 duration-300 group-hover:py-12 transition-all">
              <h3 className="font-bold text-xl lg:text-3xl tracking-wider mb-2 text-center">
                {info.title}
              </h3>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Error handling for missing or invalid infoItems
  if (!Array.isArray(infoItems) || infoItems.length === 0) {
    console.error("Invalid or missing infoItems:", infoItems);
    return (
      <div className="text-center text-red-500 p-4">
        Error: Unable to load information items. Please try again later.
      </div>
    );
  }

  return (
    <motion.article
      {...fadeInConfig}
      className="z-20 mx-auto container h-full flex flex-col justify-between relative"
    >
      <motion.h1
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.8,
        }}
        viewport={{ once: true }}
        className="h1-titles font-bold tracking-widest my-4"
      >
        {title || "Information"}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-4 text-md md:text-lg text-uiwhite flex-grow-[0.3]"
      >
        {description || "No description available."}
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80%]">
        {infoItems.map((info, index) => (
          <InfoCard key={info.id} i={index} info={info} />
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent
          forceMount
          className="text-uiblack w-[90vw] max-w-[1200px] h-[90vh] rounded-none m-0 p-0 overflow-hidden"
        >
          {selectedInfo && (
            <div className="relative w-full h-full flex flex-col">
              <div className="relative w-full h-1/2">
                <Image
                  src={selectedInfo.image.image_url}
                  alt={selectedInfo.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-uiwhite/80 p-6">
                  <DialogTitle>
                    <motion.p
                      initial={{ rotate: 20 }}
                      animate={modalOpen ? { rotate: 0 } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-xl md:text-3xl font-bold"
                    >
                      {selectedInfo.title}
                    </motion.p>
                  </DialogTitle>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-6 bg-white">
                <div
                  className="text-sm md:text-base prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(selectedInfo.description || ""),
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ScrollDown color="uiwhite" href="#press" className="py-2" />
    </motion.article>
  );
}
