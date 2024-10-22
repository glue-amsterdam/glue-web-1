"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InfoItem } from "@/utils/about-types";
import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";

interface InfoSectionProps {
  infoItems: InfoItem[];
}

export default function InfoSection({ infoItems }: InfoSectionProps) {
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
        className="relative shadow-md overflow-hidden min-h-[20vh]"
        onViewportEnter={() => (hasAnimatedRef.current = true)}
      >
        <Card
          className="cursor-pointer rounded-none border-none group shadow-md"
          onClick={() => openModal(info)}
        >
          <img
            src={info.image}
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
    <section
      id="info"
      aria-labelledby="info-heading"
      className="section-container"
    >
      <div className="screen-size">
        <motion.h2
          id="info-heading"
          className="h2-titles font-bold"
          initial={{ opacity: 0, x: 70 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          Information
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80%] place-content-center md:place-content-stretch">
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
                  src={selectedInfo.image}
                  alt={selectedInfo.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg mb-4"
                />
                <div className="absolute z-20 bottom-0 left-0 right-0 bg-uiwhite p-6 transition-all duration-300 ease-in-out md:opacity-0 md:group-hover:opacity-100">
                  <DialogTitle>
                    <motion.h4
                      initial={{ rotate: 20 }}
                      animate={modalOpen ? { rotate: 0 } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-xl md:text-3xl"
                    >
                      {selectedInfo?.title}
                    </motion.h4>
                    <p className="text-sm md:text-base mt-2">
                      {selectedInfo?.description}
                    </p>
                  </DialogTitle>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <ScrollDown color="uiwhite" href="#press" />
    </section>
  );
}
