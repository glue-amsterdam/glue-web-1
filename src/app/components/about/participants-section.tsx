"use client";

import ScrollDown from "@/app/components/scroll-down";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ParticipantClient } from "@/schemas/participantsSchema";
import { fadeInConfig } from "@/utils/animations";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { UserPlusIcon } from "lucide-react";
import Link from "next/link";

interface ParticipantsSection {
  title: string;
  description: string;
  participants: ParticipantClient[];
}

export default function ParticipantsSection({
  participants,
  description,
  title,
}: ParticipantsSection) {
  const slicedParticipants = participants?.slice(0, 20) || [];

  return (
    <motion.article
      {...fadeInConfig}
      className="z-20 mx-auto about-w h-full flex flex-col justify-between relative w-full"
    >
      <div className="flex items-center justify-between">
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
        <Link href={"/participants"}>
          <Button type="button" variant="ghost">
            <UserPlusIcon />
            <span className="text-lg">View All</span>
          </Button>
        </Link>
      </div>
      <div className="relative h-[70%] w-full">
        <Carousel
          plugins={[
            Autoplay({
              stopOnMouseEnter: true,
              delay: 2000,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: false,
          }}
          className="w-full h-full"
        >
          <CarouselContent className="flex h-full z-10">
            {slicedParticipants.map((participant, index) => (
              <CarouselItem key={index} className="basis-48 md:basis-56 h-full">
                <Link href={`/participants/${participant.slug}`}>
                  <Card className="border-none shadow-sm bg-transparent hover:shadow-md transition-shadow duration-300 max-w-full h-full">
                    <CardContent className="p-0 h-full w-full relative group">
                      <img
                        src={
                          participant.image?.image_url ||
                          "/participant-placeholder.jpg" ||
                          "/placeholder.svg"
                        }
                        alt={`${participant.userName} profile image thumbnail`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <p className="text-center font-semibold text-xs truncate px-2">
                          {participant.userName}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-2 z-30 text-black" />
          <CarouselNext className="absolute -right-2 z-30 text-black" />
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
