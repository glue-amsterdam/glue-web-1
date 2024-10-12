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
      className="mb-12 space-y-10 container mx-auto px-4 relative"
      aria-labelledby="participants-heading"
    >
      <motion.h2
        id="participants-heading"
        className="text-5xl md:text-7xl uppercase tracking-widest font-bold"
        initial={{ opacity: 0, x: 70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
      >
        Participants
      </motion.h2>
      <motion.div
        initial={{ rotate: 10 }}
        whileInView={{ rotate: 0 }}
        viewport={{ amount: "all", once: true, margin: "40%" }}
      >
        <Carousel
          className="w-[70%] mx-auto sm:w-full"
          plugins={[
            Autoplay({
              stopOnMouseEnter: true,
              delay: 2000,
            }),
          ]}
        >
          <CarouselContent className="rounded-none">
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
                            className="w-full h-full object-cover"
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
      </motion.div>
    </section>
  );
}
