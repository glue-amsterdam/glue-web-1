"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  years: number[];
  curatedMembers: CuratedMember[];
}

export default function CuratedMembers({
  years,
  curatedMembers,
}: CuratedMembersProps) {
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
      whileInView={{ y: 0, scale: 1, rotate: 0 }}
      viewport={{ margin: "500px", once: true }}
      transition={{ delay: i / 6 }}
    >
      <Card>
        <CardContent className="p-4 text-center">
          <h3 className="font-semibold">{member.name}</h3>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <motion.h2
          id="curated-members-heading"
          className="text-7xl uppercase tracking-wider font-bold mb-6"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
        >
          Curated Sticky Members
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredMembers.map((member, i) => (
          <MemberCard key={member.id} member={member} i={i} />
        ))}
      </div>
    </div>
  );
}
