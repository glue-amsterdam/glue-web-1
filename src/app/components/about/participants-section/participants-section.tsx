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

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  return (
    <section
      className="mb-12 space-y-10 container mx-auto px-4 relative"
      aria-labelledby="participants-heading"
    >
      <motion.div
        initial={{ rotate: 25, opacity: 0 }}
        whileInView={{ rotate: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.5 }}
      >
        <Carousel
          className="w-full md:w-[80%] mx-auto mt-[10vh] md:mt-auto"
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
                className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <Link
                  target="_blank"
                  href={`/members/${encodeURIComponent(
                    generateSlug(participant.name)
                  )}`}
                >
                  <div className="p-1">
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                      <CardContent className="flex h-80 items-center justify-center p-0">
                        <div className="relative w-full h-full group">
                          <img
                            src={participant.images[0]}
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
      </motion.div>{" "}
      <motion.h2
        id="participants-heading"
        className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl uppercase tracking-widest font-bold text-uiblack text-right mt-4"
        initial={{ opacity: 0, x: -70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Participants
      </motion.h2>
    </section>
  );
}
