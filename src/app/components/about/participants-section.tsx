"use client";

import { ScrollableText } from "@/app/components/about/scrolleable-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ParticipantClient } from "@/schemas/participantsSchema";
import { fadeInConfig } from "@/utils/animations";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { UserPlusIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
      className="z-20 mx-auto about-w h-full flex flex-col gap-2 justify-around py-4 w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        <Link href={"/participants"}>
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto bg-gray text-black"
          >
            <UserPlusIcon className="mr-2 h-4 w-4" />
            <span className="text-base sm:text-lg">View All</span>
          </Button>
        </Link>
      </div>
      <>
        <div className="relative flex-grow w-full">
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
                <CarouselItem
                  key={index}
                  className="basis-36 sm:basis-48 md:basis-56 h-full"
                >
                  <Link href={`/participants/${participant.slug}`}>
                    <Card className="border-none shadow-sm bg-transparent hover:shadow-md transition-shadow duration-300 max-w-full h-full">
                      <CardContent className="p-0 h-full w-full relative group">
                        <div className="relative w-full h-full aspect-square">
                          <Image
                            src={
                              participant.image?.image_url || "/placeholder.jpg"
                            }
                            alt={`${participant.userName} profile image thumbnail`}
                            width={900}
                            height={1000}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            priority={index < 5}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <p className="text-center font-semibold text-xs sm:text-sm truncate px-2">
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
        <ScrollableText
          containerClassName="max-h-[20%] overflow-y-auto"
          className="mt-4 text-sm sm:text-base md:text-lg pr-4"
        >
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-uiblack pb-4"
          >
            {description}
          </motion.p>
        </ScrollableText>
      </>
    </motion.article>
  );
}
