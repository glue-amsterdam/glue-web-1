"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Sponsor } from "@/utils/about-types";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

interface SponsorsCarouselProps {
  sponsors: Sponsor[];
}

export default function SponsorsCarousel({ sponsors }: SponsorsCarouselProps) {
  return (
    <section aria-labelledby="sponsors-heading" className="space-y-4 mt-[15vh]">
      <motion.h2
        id="sponsors-heading"
        className="text-5xl md:text-7xl uppercase tracking-widest font-bold text-[#2b2b2b]"
        initial={{ opacity: 0, x: 70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
      >
        Our Sponsors
      </motion.h2>

      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            stopOnMouseEnter: true,
            delay: 1000,
          }),
        ]}
      >
        <CarouselContent>
          {sponsors.map((sponsor, index) => (
            <CarouselItem
              key={index}
              className="basis-1/3 md:basis-1/4 lg:basis-1/6"
            >
              <div className="p-1">
                <Card className="border-none">
                  <CardContent className="flex aspect-square items-center justify-center p-0">
                    <div className="relative w-full h-full group">
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
