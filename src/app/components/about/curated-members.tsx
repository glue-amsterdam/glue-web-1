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

  const MemberCard = ({ member }: { member: CuratedMember }) => (
    <Card>
      <CardContent className="p-4 text-center">
        <h3 className="font-semibold">{member.name}</h3>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 id="curated-members-heading" className="text-3xl font-bold">
          Curated Sticky Members
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredMembers.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
