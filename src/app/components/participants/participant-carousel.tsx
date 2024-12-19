"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ClientUserImage } from "@/types/api-visible-user";

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
        {images.map((image, index) => (
          <CarouselItem key={index} className="h-full">
            <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
              <img
                src={image.image_url || "/participant-placeholder.jpg"}
                alt={`GLUE ${
                  process.env.NEXT_PUBLIC_MAIN_CITY_GLUE_EVENT
                } participant ${userName}, image number ${index + 1}`}
                className="object-cover absolute inset-0 w-full h-full"
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
