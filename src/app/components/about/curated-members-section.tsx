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

interface CuratedMembersProps {
  curatedMembers: CuratedMember[];
}

export default function CuratedMembersSection({
  curatedMembers,
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
    <motion.div
      initial={{ y: 20, scale: 0, rotate: "10deg" }}
      animate={{ y: 0, scale: 1, rotate: 0 }}
      transition={{ delay: i / 6 }}
      className="flex items-center gap-2 "
    >
      <FaUserCircle />
      <h3 className="font-semibold text-base md:text-xl lg:text-2xl">
        {member.name}
      </h3>
    </motion.div>
  );

  return (
    <section
      aria-labelledby="curated-members-heading"
      className="section-container"
    >
      <div className="screen-size">
        <div className="flex justify-between mb-12">
          <motion.h2
            id="curated-members-heading"
            className="h2-titles font-bold"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            Curated Sticky Members
          </motion.h2>
          <Select onValueChange={handleYearChange} value={selectedYear}>
            <SelectTrigger className="w-[180px] mt-4 rounded-none">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredMembers.map((member, i) => (
            <div key={member.id}>
              <MemberCard member={member} i={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
