"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { CuratedParticipantWithYear } from "@/schemas/usersSchemas";
import { cn } from "@/lib/utils";

interface CuratedParticipantsGridProps {
  filteredCurated: CuratedParticipantWithYear[];
}

export function CuratedParticipantsGrid({
  filteredCurated,
}: CuratedParticipantsGridProps) {
  return (
    <div className="scrollbar-thin scrollbar-thumb-gray scrollbar-track-gray/20 leading-relaxed grid grid-cols-1 md:grid-cols-3 overflow-y-auto max-h-[45vh]">
      {filteredCurated.map((participant, index) => (
        <ParticipantCard
          key={participant.slug}
          participant={participant}
          index={index}
        />
      ))}
    </div>
  );
}

interface ParticipantCardProps {
  participant: CuratedParticipantWithYear;
  index: number;
}

function ParticipantCard({ participant, index }: ParticipantCardProps) {
  return (
    <Link
      href={`/participants/${participant.slug}`}
      target="_blank"
      className=""
    >
      <motion.div
        initial={{ y: 20, scale: 0, rotate: "10deg" }}
        animate={{ y: 0, scale: 1, rotate: 0 }}
        transition={{
          delay: index / 6,
          duration: 0.3,
        }}
        className={cn(
          "flex items-center gap-2",
          "transition-all duration-300",
          "hover:bg-white",
          "mb-2 px-2 group"
        )}
      >
        <div className="relative size-8 md:size-10 lg:size-12 rounded-full overflow-hidden">
          <Image
            src={participant.image?.image_url || "/placeholder.jpg"}
            alt={participant.image?.alt || "Participant profile image"}
            width={300}
            height={300}
            sizes="33vw"
            className="object-cover group-hover:scale-110 transition-all rounded-full"
            layout="responsive"
          />
        </div>
        <h3 className="font-semibold text-base md:text-lg lg:text-xl text-balance group-hover:scale-110 transition-all group-hover:text-black">
          {participant.userName}
        </h3>
      </motion.div>
    </Link>
  );
}
