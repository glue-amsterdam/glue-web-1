"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { config } from "@/env";
import type { ClientUserImage } from "@/types/api-visible-user";
import Image from "next/image";
import { useRef } from "react";

export default function ParticipantImageCarousel({
  images,
  userName,
}: {
  userName: string;
  images: ClientUserImage[];
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselContentRef = useRef<HTMLDivElement>(null);
  const carouselItemsRef = useRef<HTMLDivElement[]>([]);

  return (
    <Carousel ref={carouselRef} className="h-full bg-[var(--color-box2)]">
      <CarouselContent ref={carouselContentRef} className="p-0 h-full">
        {images.length === 0 && (
          <CarouselItem
            ref={(el) => {
              if (el) carouselItemsRef.current[0] = el;
            }}
            className="h-full carousel-item "
          >
            <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
              <Image
                sizes="(max-width: 768px) 100vw, 70vw"
                width={1920}
                height={1080}
                quality={95}
                src="/placeholder.jpg"
                alt={`GLUE ${config.cityName} participant ${userName}, image number 1`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        )}
        {images.map((image, index) => (
          <CarouselItem
            key={index}
            className="h-full carousel-item "
            ref={(el) => {
              if (el) carouselItemsRef.current[index] = el;
            }}
          >
            <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105 ">
              <Image
                sizes="(max-width: 768px) 100vw, 50vw"
                width={1920}
                height={1080}
                src={image.image_url || "/placeholder.jpg"}
                alt={`GLUE ${
                  config.cityName
                } participant ${userName}, image number ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="carousel-prev text-uiblack absolute left-2 top-1/2 transform -translate-y-1/2 z-40" />
      <CarouselNext className="carousel-next text-uiblack absolute right-2 top-1/2 transform -translate-y-1/2 z-40" />
    </Carousel>
  );
}
