"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Participant } from "@/utils/about-types";
import Link from "next/link";

interface ParticipantsSectionProps {
  participants: Participant[];
}

export default function ParticipantsSection({
  participants,
}: ParticipantsSectionProps) {
  if (!participants || participants.length === 0) {
    return <div className="text-center py-8">No Participants Data</div>;
  }

  return (
    <section
      className="mb-12 container mx-auto px-4"
      aria-labelledby="participants-heading"
    >
      <motion.h2
        id="participants-heading"
        className="text-4xl text-center uppercase font-bold"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Participants
      </motion.h2>
      <Carousel
        className="w-[70%] mx-auto sm:w-full"
        plugins={[
          Autoplay({
            stopOnMouseEnter: true,
            delay: 2000,
          }),
        ]}
      >
        <CarouselContent>
          {participants.map((participant, index) => (
            <CarouselItem
              key={index}
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <Link
                target="_blank"
                href={`/member/${encodeURIComponent(participant.name)}`}
              >
                <div className="p-1">
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardContent className="flex aspect-square items-center justify-center p-0">
                      <div className="relative w-full h-full group">
                        <img
                          src={participant.image}
                          alt={participant.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <p className="text-center font-semibold text-sm">
                            {participant.name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex text-black" />
        <CarouselNext className="hidden md:flex text-black" />
      </Carousel>
    </section>
  );
}
