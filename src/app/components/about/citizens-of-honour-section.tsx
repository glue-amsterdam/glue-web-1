"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Citizen, CitizensSectionContent } from "@/utils/about-types";
import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";

export default function CitizenOfHonourSection({
  citizens,
  description,
  title,
}: CitizensSectionContent) {
  const initialCitizens = citizens;
  const years = Array.from(
    new Set(initialCitizens.map((citizen) => citizen.year))
  ).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<string>(
    years[0]?.toString() || "all"
  );
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredCitizens = useMemo(() => {
    if (selectedYear === "all") return initialCitizens;
    return initialCitizens.filter(
      (citizen) => citizen.year.toString() === selectedYear
    );
  }, [initialCitizens, selectedYear]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const openModal = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setModalOpen(true);
  };

  const CitizenCard = ({ citizen, i }: { citizen: Citizen; i: number }) => (
    <motion.div
      initial={{
        y: 50,
        opacity: 0,
      }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: i / 6 }}
      className="h-full"
    >
      <Card
        className="cursor-pointer h-full border-none "
        onClick={() => openModal(citizen)}
      >
        <CardContent className="p-0 h-full">
          <div className="relative w-full h-full group">
            <div className="citizen-triangle bg-uiblack z-10 group-hover:opacity-50 opacity-20 transition-all" />
            <img
              src={citizen.image}
              alt={citizen.name}
              className="absolute inset-0 w-full h-full object-cover z-0 group-hover:grayscale-[0] md:grayscale-[0.2]"
            />
            <div className="z-30 absolute bottom-0 right-0">
              <h3 className="font-bold text-uiwhite text-right text-lg w-[90%] md:text-4xl">
                {citizen.name}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <article className="z-20 mx-auto container h-full flex flex-col justify-between relative">
      <div className="flex justify-between md:items-center my-4">
        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.8,
          }}
          viewport={{ once: true }}
          className="h1-titles font-bold tracking-widest text-uiblack"
        >
          {title}
        </motion.h1>
        <Select onValueChange={handleYearChange} value={selectedYear}>
          <SelectTrigger className="w-[180px] bg-uiblack rounded-none">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-[70%]">
        {filteredCitizens.map((citizen, index) => (
          <CitizenCard key={citizen.id} i={index} citizen={citizen} />
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="text-uiwhite min-w-[50vw] border-none rounded-none bg-transparent">
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
                <p className="text-sm font-bold flex flex-col">
                  <span>Year</span>
                  <span>{selectedCitizen?.year}</span>
                </p>
              </motion.div>
              <p className="absolute bottom-0 py-4 px-2 text-right bg-uiblack/20 text-sm z-20">
                {selectedCitizen?.description}
              </p>

              <img
                src={selectedCitizen.image}
                alt={selectedCitizen.name}
                className="absolute inset-0 w-full h-full object-cover mb-4 z-0"
              />
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
    </article>
  );
}
