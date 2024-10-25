"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Image } from "@/utils/about-types";

export function ImageCarousel({ images }: { images: Image[] }) {
  return (
    <Carousel className="h-full">
      <CarouselContent className="p-0 h-full">
        {images.map((image, index) => (
          <CarouselItem key={index} className="h-full">
            <div className="relative w-full h-full cursor-pointer transition-transform hover:scale-105">
              <img
                src={image.src}
                alt={`Member image ${index + 1}`}
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
