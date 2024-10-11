"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Sponsor } from "@/utils/about-types";
import Autoplay from "embla-carousel-autoplay";

interface SponsorsCarouselProps {
  sponsors: Sponsor[];
}

export default function SponsorsCarousel({ sponsors }: SponsorsCarouselProps) {
  return (
    <div className="space-y-4">
      <h2 id="sponsors-heading" className="text-3xl font-bold mb-6">
        Our Sponsors
      </h2>

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
                        <p className="text-center font-semibold">
                          {sponsor.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
