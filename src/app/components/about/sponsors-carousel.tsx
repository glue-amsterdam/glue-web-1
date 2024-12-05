"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SponsorsSection } from "@/schemas/sponsorsSchema";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function SponsorsCarousel({
  sponsorsData,
}: {
  sponsorsData: SponsorsSection;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 h-full">
      <motion.h1
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.8,
        }}
        viewport={{ once: true }}
        className="h1-titles font-bold tracking-widest text-uiblack pt-2 text-center mb-2 text-xl md:text-2xl lg:text-3xl"
      >
        {sponsorsData.sponsorsHeaderSchema.title}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-sm md:text-md lg:text-lg text-uiblack text-center mb-4"
      >
        {sponsorsData.sponsorsHeaderSchema.description}
      </motion.p>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full h-full"
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
      >
        <CarouselContent className="h-full">
          {sponsorsData.sponsors.map((sponsor, index) => (
            <CarouselItem
              key={index}
              className="xs:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <Link
                href={sponsor.website || "#"}
                target={sponsor.website ? "_blank" : "_self"}
                className="block w-full md:h-20 relative group h-44 lg:h-60"
              >
                <div className="w-full relative h-full flex items-center justify-center">
                  <Image
                    src={sponsor.image_url}
                    alt={sponsor.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-uiblack bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center">
                    <p className="font-semibold text-xs md:text-sm">
                      {sponsor.name}
                    </p>
                    <p className="text-xs">{sponsor.sponsor_type}</p>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
