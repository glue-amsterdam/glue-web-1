"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";
import { fadeInConfig } from "@/utils/animations";
import { PressItem } from "@/schemas/pressSchema";
import Image from "next/image";
import DOMPurify from "dompurify";
import { DialogDescription } from "@radix-ui/react-dialog";
import { NoDataAvailable } from "@/app/components/no-data-available";

interface PressSectionProps {
  pressItems: PressItem[];
  title: string;
  description: string;
}

export default function PressSection({
  pressItems,
  title,
  description,
}: PressSectionProps) {
  const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);
  const hasAnimatedRef = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (item: PressItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const visiblePressItems = pressItems.filter((item) => item.isVisible);
  const hasGlueTV = visiblePressItems.length === 2;

  const closeModal = () => {
    setModalOpen(false);
  };

  if (visiblePressItems.length <= 0)
    return (
      <div className="h-full">
        <NoDataAvailable />
      </div>
    );

  const PressCard = ({ item, i }: { item: PressItem; i: number }) => {
    const xSide = i === 0 ? -100 : 100;
    const ySide = i === 0 ? -100 : 100;
    const rotateSide = i === 0 ? -20 : 20;

    if (!item.isVisible) return null;

    return (
      <motion.div
        initial={{
          x: hasAnimatedRef.current ? 0 : xSide,
          y: hasAnimatedRef.current ? 0 : ySide,
          opacity: hasAnimatedRef.current ? 1 : 0,
          rotate: hasAnimatedRef.current ? 0 : rotateSide,
        }}
        whileInView={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative shadow-md overflow-hidden h-full"
        onViewportEnter={() => (hasAnimatedRef.current = true)}
      >
        <Card
          className="cursor-pointer rounded-none border-none group shadow-md h-full"
          onClick={() => openModal(item)}
        >
          <div className="relative w-full h-full">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
              className="object-cover group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-uiblack/50 w-full text-uiwhite py-4 duration-300 group-hover:py-12 transition-all">
              <h3 className="font-bold text-xl lg:text-3xl tracking-wider mb-2 text-center">
                {item.title}
              </h3>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Error handling for missing or invalid infoItems
  if (!Array.isArray(pressItems) || pressItems.length === 0) {
    console.error("Invalid or missing press Items:", pressItems);
    return (
      <div className="text-center text-red-500 p-4">
        Error: Unable to load press infomation items. Please try again later.
      </div>
    );
  }

  return (
    <motion.article
      {...fadeInConfig}
      className="z-20 mx-auto about-w h-full flex flex-col justify-between relative"
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
        {title || "Press"}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-4 text-md md:text-lg text-uiwhite flex-grow-[0.3]"
      >
        {description || "No description available."}
      </motion.p>
      <div
        className={`grid grid-cols-1 gap-6 h-[80%] ${
          hasGlueTV && "md:grid-cols-2"
        }`}
      >
        {pressItems.map((item, index) => (
          <PressCard key={item.id} i={index} item={item} />
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent
          forceMount
          className="text-uiblack w-[90vw] max-w-[1200px] h-[90vh] rounded-none m-0 p-0 overflow-hidden"
        >
          {selectedItem && (
            <div className="relative w-full h-full flex flex-col">
              <div className="relative w-full h-1/2">
                <Image
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-uiwhite/80 p-6">
                  <DialogTitle>
                    <motion.p
                      initial={{ rotate: 20 }}
                      animate={modalOpen ? { rotate: 0 } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-xl md:text-3xl font-bold"
                    >
                      {selectedItem.title}
                    </motion.p>
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detailed information about {selectedItem.title}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-6 bg-white">
                <div
                  className="text-sm md:text-base prose max-w-none font-overpass"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(selectedItem.description || ""),
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ScrollDown color="uiblack" href="#last" className="py-2" />
    </motion.article>
  );
}
