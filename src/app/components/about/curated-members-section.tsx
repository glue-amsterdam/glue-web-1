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
import { CuratedMember } from "@/utils/about-types";

import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";
import Link from "next/link";

interface CuratedMembersProps {
  curatedMembers: CuratedMember[];
  title: string;
  description: string;
}

export default function CuratedMembersSection({
  curatedMembers,
  title,
  description,
}: CuratedMembersProps) {
  const years = Array.from(
    new Set(curatedMembers.map((curatedMember) => curatedMember.year))
  ).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<string>(
    years.length > 0 ? years[0].toString() : ""
  );

  const filteredMembers = useMemo(() => {
    return curatedMembers.filter(
      (member) => member.year.toString() === selectedYear
    );
  }, [curatedMembers, selectedYear]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const MemberCard = ({ member, i }: { member: CuratedMember; i: number }) => (
    <Link
      target="_blank"
      href={`/members/${member.slug}`}
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
          {member.name}
        </h3>
      </motion.div>
    </Link>
  );

  return (
    <article className="z-20 mx-auto container h-full flex flex-col justify-between relative">
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
            className="h1-titles font-bold tracking-widest "
          >
            {title}
          </motion.h1>
          <Select onValueChange={handleYearChange} value={selectedYear}>
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
        {filteredMembers.map((member, i) => (
          <MemberCard key={member.id} member={member} i={i} />
        ))}
      </div>

      <ScrollDown color="uiwhite" href="#info" className="py-2" />
    </article>
  );
}
