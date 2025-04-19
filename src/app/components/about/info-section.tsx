"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { fadeInConfig } from "@/utils/animations";
import DOMPurify from "dompurify";
import type { InfoItemClient } from "@/schemas/infoSchema";
import Image from "next/image";
import { DialogDescription } from "@radix-ui/react-dialog";
import InfoCard from "@/app/components/about/info-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ScrollableText } from "@/app/components/about/scrolleable-text";

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
            {`We're currently preparing the Info Items. Check back soon.`}
          </AlertDescription>
        </Alert>
      </motion.div>
    );

  const infoLength = infoItems.length;

  return (
    <motion.article
      {...fadeInConfig}
      className="z-20 mx-auto about-w h-full flex flex-col justify-around relative"
    >
      <motion.h1
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.8,
        }}
        viewport={{ once: true }}
        className="h1-titles font-bold tracking-widest"
      >
        {title || "Information"}
      </motion.h1>
      <ScrollableText
        containerClassName="max-h-[15%] overflow-hidden"
        className="mt-4 text-sm sm:text-base md:text-lg pr-4"
      >
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-uiwhite pb-4"
        >
          {description || "No description available."}
        </motion.p>
      </ScrollableText>
      <div
        className={`grid grid-cols-1 gap-6 h-[80%] pb-10
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
          className="text-uiblack w-[90vw] max-w-full h-[90vh] rounded-none m-0 p-0 overflow-hidden"
        >
          {selectedInfo && (
            <div className="relative w-full h-full flex flex-col lg:flex-row">
              <div className="relative w-full lg:w-1/2 lg:h-full aspect-[2/1] md:aspect-auto">
                <Image
                  src={selectedInfo.image_url || "/placeholder.jpg"}
                  alt={selectedInfo.title}
                  width={1600}
                  height={900}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  className="object-cover w-full h-full object-center"
                  quality={70}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-uiwhite/80 p-6 lg:hidden">
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

              {/* Contenido - Ocupa la mitad derecha en pantallas grandes */}
              <div className="flex-grow overflow-y-auto p-6 bg-white lg:w-1/2">
                {/* Título visible solo en pantallas grandes */}
                <div className="hidden lg:block mb-6">
                  <DialogTitle>
                    <motion.p
                      initial={{ rotate: 20 }}
                      animate={modalOpen ? { rotate: 0 } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-3xl font-bold"
                    >
                      {selectedInfo.title}
                    </motion.p>
                  </DialogTitle>
                </div>

                <div
                  className="text-sm md:text-base prose max-w-none font-overpas text-black"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(selectedInfo.description || ""),
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.article>
  );
}
