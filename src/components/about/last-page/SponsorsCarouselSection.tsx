"use client";

import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { SponsorsSection } from "@/schemas/sponsorsSchema";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function SponsorsCarouselSection({
  sponsorsData,
}: {
  sponsorsData: SponsorsSection;
}) {
  const sanitizedTitle = useSanitizedHTML(
    sponsorsData.sponsorsHeaderSchema.title
  );
  const sanitizedDescription = useSanitizedHTML(
    sponsorsData.sponsorsHeaderSchema.description
  );
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
        <h2
          style={{ color: sponsorsData.sponsorsHeaderSchema.text_color }}
          className="font-bold tracking-widest text-center text-2xl md:text-4xl lg:text-7xl"
          dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
        />
        <p
          style={{ color: sponsorsData.sponsorsHeaderSchema.text_color }}
          className="text-sm md:text-md lg:text-lg text-center"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
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
                <div className="relative w-full aspect-square flex items-center justify-center">
                  <Image
                    src={sponsor.image_url || "/placeholder.jpg"}
                    alt={sponsor.name}
                    width={300}
                    height={300}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-105 w-full h-full"
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
