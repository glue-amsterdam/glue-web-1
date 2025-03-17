"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { config } from "@/env";
import { ClientUserImage } from "@/types/api-visible-user";
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
                fill
                src="/placeholder.jpg"
                alt={`GLUE ${config.cityName} participant ${userName}, image number 1`}
                className="object-cover"
              />
            </div>
          </CarouselItem>
        )}
        {images.map((image, index) => (
          <CarouselItem key={index} className="h-full">
            <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
              <Image
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                src={image.image_url}
                alt={`GLUE ${
                  config.cityName
                } participant ${userName}, image number ${index + 1}`}
                className="object-cover"
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
