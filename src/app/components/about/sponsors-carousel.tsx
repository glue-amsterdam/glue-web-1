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
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.8,
        }}
        viewport={{ once: true }}
        className="h1-titles font-bold tracking-widest text-uiblack pt-4 text-center mb-4"
      >
        {sponsorsData.sponsorsHeaderSchema.title}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-md md:text-lg text-uiblack text-center mb-8"
      >
        {sponsorsData.sponsorsHeaderSchema.description}
      </motion.p>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
      >
        <CarouselContent>
          {sponsorsData.sponsors.map((sponsor, index) => (
            <CarouselItem
              key={index}
              className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <Link
                href={sponsor.website || "#"}
                target={sponsor.website ? "_blank" : "_self"}
                className="block w-full h-24 relative group"
              >
                <div className="w-full relative h-full flex items-center justify-center">
                  <Image
                    src={sponsor.image_url}
                    alt={sponsor.name}
                    fill
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-uiblack bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center">
                    <p className="font-semibold">{sponsor.name}</p>
                    <p className="text-sm">{sponsor.sponsor_type}</p>
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
