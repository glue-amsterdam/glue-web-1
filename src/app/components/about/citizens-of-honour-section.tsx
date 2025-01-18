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
import ScrollDown from "@/app/components/scroll-down";
import { fadeInConfig } from "@/utils/animations";
import { ClientCitizen, ClientCitizensSection } from "@/schemas/citizenSchema";
import { NAVBAR_HEIGHT } from "@/constants";
import { useScroll } from "@/app/hooks/useScroll";
import Image from "next/image";

interface CitizenCardProps {
  citizen: ClientCitizen;
  openModal: (citizen: ClientCitizen) => void;
}

const CitizenCard = ({ citizen, openModal }: CitizenCardProps) => {
  return (
    <Card
      className="cursor-pointer h-full border-none "
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
            src={citizen.image_url}
            alt={
              "Image of " +
              citizen.name +
              " citizen of honour from the GLUE desing routes, year" +
              citizen.year
            }
            fill
            quality={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
            className="object-cover z-0 group-hover:grayscale-[0] md:grayscale-[0.2]"
          />
          <div className="z-30 absolute bottom-0 right-0">
            <h3 className="font-bold text-uiwhite text-right text-lg w-[90%] md:text-4xl">
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
        className="h-full"
      >
        <CitizenCard citizen={citizen} openModal={openModal} />
      </motion.div>
    ));
  }, [filteredCitizens, openModal]);

  return (
    <section
      ref={sectionRef}
      id="citizens"
      aria-labelledby="press-heading"
      aria-label="main-content"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh snap-start relative`}
    >
      <motion.article
        {...fadeInConfig}
        className="z-20 mx-auto about-w h-full flex flex-col justify-between relative"
      >
        <div className="flex justify-between md:items-center my-4">
          <motion.h1
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.8,
            }}
            viewport={{ once: true }}
            className="h1-titles font-bold tracking-widest my-4 "
          >
            {title}
          </motion.h1>
          <Select onValueChange={handleYearChange} value={selectedYear}>
            <SelectTrigger className="w-[180px] bg-uiblack rounded-none">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-[70%]">
          <AnimatePresence>{memoizedCitizenCards}</AnimatePresence>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="text-uiwhite min-w-[50vw] border-none rounded-none bg-transparent font-overpass">
            {selectedCitizen && (
              <div className="relative w-full h-[70vh] overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute flex flex-col w-full p-4 z-20"
                >
                  <DialogTitle className="text-2xl lg:text-3xl tracking-widest">
                    {selectedCitizen?.name}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detailed information about {selectedCitizen.name}
                  </DialogDescription>
                  <p className="text-sm font-bold flex flex-col">
                    <span>Year</span>
                    <span>{selectedCitizen?.year}</span>
                  </p>
                </motion.div>
                <p
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedCitizen.description || ""
                    ),
                  }}
                  className="absolute bottom-0 py-4 px-2 text-right bg-black/40 text-sm z-20"
                />
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={selectedCitizen.image_url}
                    alt={
                      "Image of " +
                      selectedCitizen.name +
                      " citizen of honour from the GLUE desing routes"
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
                    className="object-cover"
                    quality={100}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="opacity-90 mt-4 text-md md:text-lg flex-grow-[0.3]"
        >
          {description}
        </motion.p>
        <ScrollDown color="uiwhite" href="#curated" className="py-2" />
      </motion.article>
    </section>
  );
}
