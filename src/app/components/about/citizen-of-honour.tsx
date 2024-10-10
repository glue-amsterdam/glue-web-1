"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Citizen } from "@/utils/about-types";

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
    <Card className="cursor-pointer" onClick={() => openModal(citizen)}>
      <CardContent className="p-0">
        <div className="relative w-full h-48">
          <img
            src={citizen.image}
            alt={citizen.name}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
          />
        </div>
        <div className="p-4">
          <>
            <h3 className="font-bold text-lg mb-2">{citizen.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {citizen.description}
            </p>
          </>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-evenly">
        <h2 id="citizens-heading" className="text-3xl font-bold mb-6">
          Creative Citizens of Honour
        </h2>
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
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>{selectedCitizen?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {selectedCitizen && (
              <div className="relative w-full h-[400px]">
                <img
                  src={selectedCitizen.image}
                  alt={selectedCitizen.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg mb-4"
                />
              </div>
            )}
            <p>{selectedCitizen?.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Year: {selectedCitizen?.year}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
