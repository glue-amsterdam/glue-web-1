"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Sponsor } from "@/utils/sponsors-types";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import Link from "next/link";

interface SponsorsCarouselProps {
  sponsors: Sponsor[];
  title: string;
  description: string;
}

export default function SponsorsCarousel({
  sponsors,
  title,
  description,
}: SponsorsCarouselProps) {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.8,
        }}
        viewport={{ once: true }}
        className="h1-titles font-bold tracking-widest text-uiblack pt-4"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-md md:text-lg text-uiblack flex-grow-[0.3]"
      >
        {description}
      </motion.p>
      <section
        aria-labelledby="sponsors-heading"
        className="h-full flex items-start"
      >
        <Carousel
          className="w-full h-full"
          plugins={[
            Autoplay({
              stopOnMouseEnter: true,
              delay: 1000,
            }),
          ]}
        >
          <CarouselContent className="h-full">
            {sponsors.map((sponsor, index) => (
              <CarouselItem
                key={index}
                className="basis-1/4 lg:basis-1/6 h-full"
              >
                <Link
                  href={sponsor.website ? sponsor.website : ""}
                  target={sponsor.website && "_blank"}
                >
                  <Card className="border-none shadow-none bg-transparent h-full transition-shadow duration-300">
                    <CardContent className="flex items-center justify-center p-0 h-full">
                      <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
                        <img
                          src={sponsor.logo.image_url}
                          alt={sponsor.name}
                          className="w-full h-full absolute object-cover"
                        />
                        <div className="absolute inset-0 bg-uiblack bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <div>
                            <p className="text-center font-semibold">
                              {sponsor.name}
                            </p>
                            <p className="text-center font-semibold">
                              {sponsor.sponsorT}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>
    </>
  );
}
