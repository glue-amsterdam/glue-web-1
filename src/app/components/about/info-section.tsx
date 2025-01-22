"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";
import { fadeInConfig } from "@/utils/animations";
import DOMPurify from "dompurify";
import { InfoItemClient } from "@/schemas/infoSchema";
import Image from "next/image";
import { DialogDescription } from "@radix-ui/react-dialog";
import InfoCard from "@/app/components/about/info-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [selectedInfo, setSelectedInfo] = useState<InfoItemClient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = () => {
    setModalOpen(false);
  };

  if (infoItems.length <= 0)
    return (
      <motion.div
        {...fadeInConfig}
        className="flex items-center justify-center h-full z-10"
      >
        <Alert variant="default" className="max-w-lg bg-uiwhite text-uiblack">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">
            No Press Items
          </AlertTitle>
          <AlertDescription className="text-md">
            {`We’re currently preparing the Info Items. Check back soon.`}
          </AlertDescription>
        </Alert>
      </motion.div>
    );

  const infoLength = infoItems.length;

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
      <div
        className={`grid grid-cols-1 gap-6 h-[80%]
        ${infoLength === 2 && "md:grid-cols-2"}
        ${infoLength === 3 && "md:grid-cols-3"} 
        `}
      >
        {infoItems.map((info, index) => (
          <InfoCard
            key={info.id}
            i={index}
            info={info}
            setSelectedInfo={setSelectedInfo}
            setModalOpen={setModalOpen}
          />
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
                  src={selectedInfo.image_url}
                  alt={selectedInfo.title}
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
                      {selectedInfo.title}
                    </motion.p>
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detailed information about {selectedInfo.title}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-6 bg-white">
                <div
                  className="text-sm md:text-base prose max-w-none font-overpass"
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
