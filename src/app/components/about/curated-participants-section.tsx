"use client";

import { useMemo, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";
import Link from "next/link";
import { fadeInConfig } from "@/utils/animations";
import { CuratedParticipantWhitYear } from "@/utils/user-types";

interface CuratedMembersSectionProps {
  curatedParticipants: Record<number, CuratedParticipantWhitYear[]>;
  title: string;
  description: string;
}

export default function CuratedMembersSection({
  curatedParticipants,
  title,
  description,
}: CuratedMembersSectionProps) {
  const years = Object.keys(curatedParticipants)
    .map(Number)
    .sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number>(
    years.length > 0 ? years[0] : 0
  );

  const filteredCurated = useMemo(() => {
    return curatedParticipants[selectedYear] || [];
  }, [curatedParticipants, selectedYear]);

  const handleYearChange = (year: string) => {
    setSelectedYear(Number(year));
  };

  const ParticipantCard = ({
    participant,
    i,
  }: {
    participant: CuratedParticipantWhitYear;
    i: number;
  }) => (
    <Link
      target="_blank"
      href={`/participants/${participant.slug}`}
      className="hover:scale-110 transition-all hover:rotate-1 mb-2"
    >
      <motion.div
        initial={{ y: 20, scale: 0, rotate: "10deg" }}
        animate={{ y: 0, scale: 1, rotate: 0 }}
        transition={{ delay: i / 6 }}
        className="flex items-center gap-2"
      >
        <FaUserCircle />
        <h3 className="font-semibold text-base md:text-lg lg:text-xl">
          {participant.userName}
        </h3>
      </motion.div>
    </Link>
  );

  return (
    <motion.article
      {...fadeInConfig}
      className="z-20 mx-auto container h-full flex flex-col justify-between relative"
    >
      <>
        <div className="flex justify-between md:items-center my-4">
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
            {title}
          </motion.h1>
          <Select
            onValueChange={handleYearChange}
            value={selectedYear.toString()}
          >
            <SelectTrigger className="w-[180px] rounded-none bg-uiwhite text-uiblack">
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
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-4 text-md md:text-lg text-uiwhite flex-grow-[0.3]"
        >
          {description}
        </motion.p>
      </>
      <div className="grid grid-cols-2 md:grid-cols-4 place-content-start flex-grow">
        {filteredCurated.map(
          (participant: CuratedParticipantWhitYear, i: number) => (
            <ParticipantCard
              key={participant.slug}
              participant={participant}
              i={i}
            />
          )
        )}
      </div>
      <ScrollDown color="uiwhite" href="#info" className="py-2" />
    </motion.article>
  );
}
