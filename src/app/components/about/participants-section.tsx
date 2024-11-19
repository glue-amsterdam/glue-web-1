"use client";

import ScrollDown from "@/app/components/scroll-down";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { placeholderImage } from "@/mockConstants";
import { ParticipantUser } from "@/schemas/usersSchemas";
import { fadeInConfig } from "@/utils/animations";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import Link from "next/link";

interface ParticipantsSection {
  title: string;
  description: string;
  participants: ParticipantUser[];
}

export default function ParticipantsSection({
  participants,
  description,
  title,
}: ParticipantsSection) {
  if (!participants || participants.length === 0) {
    return <div className="text-center py-8">No Participants Data</div>;
  }

  const slicedParticipants = participants.slice(0, 10);

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  return (
    <motion.article
      {...fadeInConfig}
      className="z-20 mx-auto container h-full flex flex-col justify-between relative"
    >
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
      <div className="h-[70%] flex items-start">
        <Carousel
          className="w-full h-full"
          plugins={[
            Autoplay({
              stopOnMouseEnter: true,
              delay: 2000,
            }),
          ]}
        >
          <CarouselContent className="h-full">
            {slicedParticipants.map((participant, index) => (
              <CarouselItem
                key={index}
                className="h-full basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 traslate-y-1/2"
              >
                <Link
                  target="_blank"
                  className="h-full"
                  href={`/participants/${encodeURIComponent(
                    generateSlug(participant.userName)
                  )}`}
                >
                  <Card className="border-none shadow-sm bg-transparent h-full hover:shadow-md transition-shadow duration-300">
                    <CardContent className="flex items-center justify-center p-0 h-full">
                      {participant.images ? (
                        <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
                          <img
                            src={participant.images[0].imageUrl}
                            alt={`${participant.userName} profile image thumbnail`}
                            className="w-full h-full absolute object-cover"
                          />
                          <div className="absolute inset-0 bg-uiblack bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <p className="text-center font-semibold text-sm">
                              {participant.userName}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
                          <img
                            src={placeholderImage.imageUrl}
                            alt={`${participant.userName} profile image thumbnail`}
                            className="w-full h-full absolute object-cover"
                          />
                          <div className="absolute inset-0 bg-uiblack bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <p className="text-center font-semibold text-sm">
                              {participant.userName}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex text-uiblack" />
          <CarouselNext className="hidden md:flex text-uiblack" />
        </Carousel>
      </div>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="opacity-90 mt-4 text-md md:text-lg text-uiblack flex-grow-[0.3]"
      >
        {description}
      </motion.p>
      <ScrollDown href="#citizens" color="uiblack" className="py-2" />
    </motion.article>
  );
}
