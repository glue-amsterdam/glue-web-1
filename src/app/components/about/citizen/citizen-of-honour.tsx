"use client";

import { useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Citizen } from "@/utils/about-types";
import { motion } from "framer-motion";

interface CitizenOfHonourContentProps {
  years: number[];
  initialCitizens: Citizen[];
}

export default function CitizenOfHonour({
  years,
  initialCitizens,
}: CitizenOfHonourContentProps) {
  const [selectedYear, setSelectedYear] = useState<string>(
    years[0]?.toString() || "all"
  );
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const hasAnimatedRef = useRef(false); // To track if animations have run

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
        y: hasAnimatedRef.current ? 0 : 50,
        opacity: hasAnimatedRef.current ? 1 : 0,
      }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: i / 6 }}
      viewport={{ once: true }}
      onViewportEnter={() => (hasAnimatedRef.current = true)} // Set flag when in view
    >
      <Card
        className="cursor-pointer border-none bg-transparent"
        onClick={() => openModal(citizen)}
      >
        <CardContent className="p-0">
          <div className="relative w-full h-52 lg:h-80 group">
            <div className="citizen-triangle bg-uiblack z-10 group-hover:opacity-20 opacity-0 transition-all" />
            <img
              src={citizen.image}
              alt={citizen.name}
              className="absolute inset-0 w-full h-full object-cover z-0 group-hover:blur-[0.2] group-hover:grayscale-[0.3]"
            />
            <div className="z-30 absolute p-5 bottom-10 right-0">
              <h3 className="font-bold text-white text-4xl">{citizen.name}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section
      className="mb-12 mt-[15vh] space-y-10 container mx-auto px-4 relative"
      aria-labelledby="citizens-heading"
    >
      <div className="flex justify-between items-center">
        <motion.h2
          id="citizens-heading"
          className="text-5xl md:text-7xl uppercase tracking-widest font-bold text-uiblack"
          initial={{ opacity: 0, x: 70 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          Creative Citizens of Honour
        </motion.h2>
        <Select onValueChange={handleYearChange} value={selectedYear}>
          <SelectTrigger className="w-[180px] bg-uiblack">
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCitizens.map((citizen, index) => (
          <CitizenCard key={citizen.id} i={index} citizen={citizen} />
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="text-white min-w-[50vw] border-none rounded-none bg-transparent">
          {selectedCitizen && (
            <div className="relative w-full h-[70vh] overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute flex items-center ustify-between w-full p-4 z-20"
              >
                <DialogTitle className="text-6xl tracking-widest">
                  {selectedCitizen?.name}
                </DialogTitle>
                <p className="text-sm font-bold">
                  Year: {selectedCitizen?.year}
                </p>
              </motion.div>
              <p className="absolute text-right text-lg bottom-5 right-5 w-1/2 z-20">
                {selectedCitizen?.description}
              </p>
              <motion.div
                initial={{ x: 1000, opacity: 0 }}
                animate={{ x: 0, opacity: 0.4 }}
                className="citizen-card-triangle bg-uiblack z-10"
                transition={{ type: "keyframes", delay: 0.5 }}
              />
              <img
                src={selectedCitizen.image}
                alt={selectedCitizen.name}
                className="absolute inset-0 w-full h-full object-cover mb-4 z-0"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
