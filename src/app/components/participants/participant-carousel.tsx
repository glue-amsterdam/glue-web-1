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

export default function ImageCarousel({
  images,
  userName,
}: {
  userName: string;
  images: ClientUserImage[];
}) {
  return (
    <Carousel className="h-full">
      <CarouselContent className="p-0 h-full">
        {images.length === 0 && (
          <CarouselItem className="h-full">
            <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
              <Image
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                width={1920}
                height={1080}
                src="/placeholder.jpg"
                alt={`GLUE ${config.cityName} participant ${userName}, image number 1`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        )}
        {images.map((image, index) => (
          <CarouselItem key={index} className="h-full">
            <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
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
      <CarouselPrevious className="text-uiblack absolute left-2 top-1/2 transform -translate-y-1/2 z-40" />
      <CarouselNext className="text-uiblack absolute right-2 top-1/2 transform -translate-y-1/2 z-40" />
    </Carousel>
  );
}
