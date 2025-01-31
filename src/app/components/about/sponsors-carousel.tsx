"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { SponsorsSection } from "@/schemas/sponsorsSchema";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function SponsorsCarousel({
  sponsorsData,
}: {
  sponsorsData: SponsorsSection;
}) {
  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
    })
  );
  const handleMouseEnter = () => {
    autoplay.current.stop();
  };

  const handleMouseLeave = () => {
    autoplay.current.play();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full mx-auto mt-16 flex flex-col justify-center"
    >
      <div>
        <motion.h2
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.8,
          }}
          viewport={{ once: true }}
          className="font-bold tracking-widest text-uiblack text-center text-2xl md:text-4xl lg:text-7xl"
        >
          {sponsorsData.sponsorsHeaderSchema.title}
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-sm md:text-md lg:text-lg text-uiblack text-center"
        >
          {sponsorsData.sponsorsHeaderSchema.description}
        </motion.p>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
        plugins={[autoplay.current]}
      >
        <CarouselContent>
          {sponsorsData.sponsors.map((sponsor, index) => (
            <CarouselItem
              key={index}
              className="xs:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <Link
                href={sponsor.website || "#"}
                target={sponsor.website ? "_blank" : "_self"}
                className="block w-full aspect-square relative group h-[80%] md:h-[90%]"
              >
                <div className="relative flex items-center justify-center h-full">
                  <Image
                    src={sponsor.image_url || "/placeholder.jpg"}
                    alt={sponsor.name}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
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
