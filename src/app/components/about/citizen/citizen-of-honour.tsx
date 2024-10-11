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

  const CitizenCard = ({ citizen }: { citizen: Citizen }) => (
    <Card
      className="cursor-pointer border-none bg-transparent "
      onClick={() => openModal(citizen)}
    >
      <CardContent className="p-0">
        <div className="relative w-full h-80 lg:h-[500px] group ">
          <div className="citizen-triangle z-10 group-hover:opacity-20 opacity-0 transition-all" />
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
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <motion.h2
          id="citizens-heading"
          className="text-7xl uppercase tracking-wider font-bold mb-6"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
        >
          Creative Citizens of Honour
        </motion.h2>
        <Select onValueChange={handleYearChange} value={selectedYear}>
          <SelectTrigger className="w-[180px]">
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

      <div className="grid grid-cols-2  lg:grid-cols-3 gap-4">
        {filteredCitizens.map((citizen) => (
          <CitizenCard key={citizen.id} citizen={citizen} />
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="text-white min-w-[50vw] border-none rounded-none bg-transparent">
          <div>
            {selectedCitizen && (
              <div className="relative w-full h-[70vh]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="citizen-card-triangle z-10"
                />
                <img
                  src={selectedCitizen.image}
                  alt={selectedCitizen.name}
                  className="absolute inset-0 w-full h-full object-cover mb-4 z-0"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute flex items-center justify-between w-full p-4"
                >
                  <DialogTitle className="text-6xl tracking-widest">
                    {selectedCitizen?.name}
                  </DialogTitle>
                  <p className="text-sm font-bold">
                    Year: {selectedCitizen?.year}
                  </p>
                </motion.div>
                <p className="absolute text-lg bottom-5 right-0 w-1/4">
                  {selectedCitizen?.description}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
