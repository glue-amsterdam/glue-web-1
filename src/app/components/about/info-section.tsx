"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";
import { fadeInConfig } from "@/utils/animations";
import { InfoItem } from "@/schemas/baseSchema";

interface InfoSectionProps {
  infoItems: InfoItem[];
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
          className="cursor-pointer rounded-none border-none group shadow-md"
          onClick={() => openModal(info)}
        >
          <img
            src={info.image.imageUrl}
            alt={info.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute bg-uiblack/50 w-full text-uiwhite py-4 duration-300 group-hover:py-12 transition-all">
            <h3 className="font-bold text-xl lg:text-3xl tracking-wider mb-2 text-center">
              {info.title}
            </h3>
          </div>
        </Card>
      </motion.div>
    );
  };

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
        {title}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-4 text-md md:text-lg text-uiwhite flex-grow-[0.3]"
      >
        {description}
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80%]">
        {infoItems.map((info, index) => (
          <InfoCard key={info.id} i={index} info={info} />
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent
          forceMount
          className="text-uiblack min-w-[80vw] rounded-none m-0 p-0"
        >
          {selectedInfo && (
            <div className="relative w-full h-[400px] md:h-[70vh] group">
              <img
                src={selectedInfo.image.imageUrl}
                alt={selectedInfo.title}
                className="absolute inset-0 w-full h-full object-cover rounded-lg mb-4"
              />
              <div className="absolute z-20 bottom-0 left-0 right-0 bg-uiwhite p-6 transition-all duration-300 ease-in-out md:opacity-0 md:group-hover:opacity-100">
                <DialogTitle>
                  <motion.p
                    initial={{ rotate: 20 }}
                    animate={modalOpen ? { rotate: 0 } : {}}
                    transition={{ duration: 0.3 }}
                    className="text-xl md:text-3xl"
                  >
                    {selectedInfo?.title}
                  </motion.p>
                  <p className="text-sm md:text-base mt-2">
                    {selectedInfo?.description}
                  </p>
                </DialogTitle>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ScrollDown color="uiwhite" href="#press" className="py-2" />
    </motion.article>
  );
}
