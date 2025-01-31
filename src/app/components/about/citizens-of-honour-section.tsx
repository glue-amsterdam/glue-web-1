"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInConfig } from "@/utils/animations";
import type {
  ClientCitizen,
  ClientCitizensSection,
} from "@/schemas/citizenSchema";
import { NAVBAR_HEIGHT } from "@/constants";
import { useScroll } from "@/app/hooks/useScroll";
import Image from "next/image";
import { ScrollableText } from "@/app/components/about/scrolleable-text";

interface CitizenCardProps {
  citizen: ClientCitizen;
  openModal: (citizen: ClientCitizen) => void;
}

const CitizenCard = ({ citizen, openModal }: CitizenCardProps) => {
  return (
    <Card
      className="cursor-pointer h-full border-none"
      onClick={() => openModal(citizen)}
    >
      <CardContent className="p-0 h-full">
        <div className="relative w-full h-full group">
          <div
            className="
              absolute inset-0 
              bg-black/10 
              backdrop-blur-xs 
              transition-all duration-300 ease-in-out
              group-hover:opacity-0 group-hover:backdrop-blur-none
              z-10
              transform-gpu
            "
          />
          <Image
            src={citizen.image_url || "/placeholder.svg"}
            alt={`${citizen.name}, citizen of honour from the GLUE design routes, year ${citizen.year}`}
            fill
            quality={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover z-0 group-hover:grayscale-[0] md:grayscale-[0.2]"
          />
          <div className="z-30 absolute bottom-0 right-0 p-2 bg-black/50 w-full">
            <h3 className="font-bold text-uiwhite text-right text-lg md:text-2xl lg:text-3xl">
              {citizen.name}
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CitizenOfHonourSection({
  citizensByYear,
  description,
  title,
}: ClientCitizensSection) {
  const years = Object.keys(citizensByYear).sort((a, b) => b.localeCompare(a));
  const initialCitizens = Object.values(citizensByYear).flat();

  const [selectedYear, setSelectedYear] = useState<string>(years[0] || "all");
  const [selectedCitizen, setSelectedCitizen] = useState<ClientCitizen | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  const filteredCitizens = useMemo(() => {
    if (selectedYear === "all") return initialCitizens;
    return citizensByYear[selectedYear] || [];
  }, [citizensByYear, selectedYear, initialCitizens]);

  const handleYearChange = useCallback((year: string) => {
    setSelectedYear(year);
  }, []);

  const openModal = useCallback((citizen: ClientCitizen) => {
    setSelectedCitizen(citizen);
    setModalOpen(true);
  }, []);

  const memoizedCitizenCards = useMemo(() => {
    return filteredCitizens.map((citizen, index) => (
      <motion.div
        key={citizen.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="w-full lg:h-full"
      >
        <CitizenCard citizen={citizen} openModal={openModal} />
      </motion.div>
    ));
  }, [filteredCitizens, openModal]);

  return (
    <section
      ref={sectionRef}
      id="citizens-of-honour"
      aria-labelledby="citizens-title"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="h-dvh snap-start relative"
    >
      <motion.article
        {...fadeInConfig}
        className="z-20 mx-auto about-w h-full flex flex-col gap-2"
      >
        <header className="flex flex-col md:flex-row justify-between md:items-center my-2 gap-4">
          <motion.h1
            id="citizens-title"
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.8,
            }}
            viewport={{ once: true }}
            className="h1-titles font-bold tracking-widest text-2xl md:text-3xl lg:text-4xl"
          >
            {title}
          </motion.h1>
          <Select onValueChange={handleYearChange} value={selectedYear}>
            <SelectTrigger className="w-full md:w-[180px] h-5 text-xs bg-white text-black rounded-none">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>
        <div className="flex flex-wrap md:flex-nowrap justify-evenly gap-4 flex-grow">
          <AnimatePresence>{memoizedCitizenCards}</AnimatePresence>
        </div>
        {selectedCitizen && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="text-uiwhite w-[90vw] md:w-[80vw] lg:w-[70vw] max-w-none h-[90vh] border-none rounded-none bg-transparent font-overpass p-0 overflow-hidden">
              <div className="relative w-full h-full flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-0 left-0 right-0 flex flex-col w-full p-4 z-20 bg-black/50"
                >
                  <DialogTitle className="text-2xl lg:text-3xl tracking-widest">
                    {selectedCitizen.name}
                  </DialogTitle>
                  <DialogDescription className="text-uiwhite/80">
                    Citizen of Honour - {selectedCitizen.year}
                  </DialogDescription>
                </motion.div>

                <div className="relative flex-grow overflow-hidden">
                  <Image
                    src={selectedCitizen.image_url || "/placeholder.jpg"}
                    alt={`${selectedCitizen.name}, citizen of honour from the GLUE design routes, year ${selectedCitizen.year}`}
                    fill
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
                    className="object-cover"
                    quality={100}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black/70 z-20 overflow-y-auto max-h-[25%] lg:max-h-[40%] scrollbar-thin scrollbar-thumb-gray scrollbar-track-gray/20">
                  <ScrollableText
                    containerClassName="h-full"
                    className="text-sm md:text-base p-4"
                  >
                    <p
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          selectedCitizen.description || ""
                        ),
                      }}
                    />
                  </ScrollableText>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <ScrollableText
          containerClassName="max-h-[20%] lg:max-h-[40%] mb-4 lg:mb-0 py-4"
          className="h-full text-sm md:text-base lg:text-lg pr-4"
        >
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="opacity-90"
          >
            {description}
          </motion.p>
        </ScrollableText>
      </motion.article>
    </section>
  );
}
