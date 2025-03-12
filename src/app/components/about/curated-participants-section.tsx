"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { fadeInConfig } from "@/utils/animations";
import { CuratedParticipantWithYear } from "@/schemas/usersSchemas";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ScrollableText } from "@/app/components/about/scrolleable-text";
import { CuratedParticipantsGrid } from "@/app/components/about/curated-participants-section-grid";

interface CuratedMembersSectionProps {
  curatedParticipants: Record<number, CuratedParticipantWithYear[]>;
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

  const NoStickyMembersMessage = () => (
    <motion.div
      {...fadeInConfig}
      className="flex items-center justify-center h-full"
    >
      <Alert variant="default" className="max-w-lg bg-uiwhite text-uiblack">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-lg font-semibold">
          No Sticky Members Yet
        </AlertTitle>
        <AlertDescription className="text-md">
          {`We’re currently preparing a list of outstanding members. Check back soon to meet these talented individuals.`}
        </AlertDescription>
      </Alert>
    </motion.div>
  );

  const hasCuratedParticipants = years.length > 0;

  return (
    <motion.article
      {...fadeInConfig}
      className="z-20 mx-auto about-w h-full overflow-hidden flex flex-col justify-evenly relative"
    >
      <div className="flex justify-between md:items-center">
        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.8,
          }}
          viewport={{ once: true }}
          className="h1-titles font-bold tracking-widest"
        >
          {title}
        </motion.h1>
        {hasCuratedParticipants && (
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
        )}
      </div>
      <ScrollableText
        containerClassName="max-h-[20%] overflow-y-auto scrollbar-thin scrollbar-thumb-gray scrollbar-track-gray/20 leading-relaxed"
        className="text-sm sm:text-base md:text-lg pr-4"
      >
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-md md:text-lg text-uiwhite flex-grow-[0.3]"
        >
          {description}
        </motion.p>
      </ScrollableText>
      {hasCuratedParticipants ? (
        <CuratedParticipantsGrid filteredCurated={filteredCurated} />
      ) : (
        <NoStickyMembersMessage />
      )}
    </motion.article>
  );
}
