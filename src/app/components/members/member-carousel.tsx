import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ImageCarousel({ images }: { images: string[] }) {
  return (
    <div className="w-full h-full">
      <Carousel className="relative w-full h-full">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index} className="">
              <div className="relative w-full h-[85vh] cursor-pointer transition-transform hover:scale-105">
                <Image
                  src={src}
                  alt={`Member image ${index + 1}`}
                  fill
                  className="object-cover -translate-y-[20%] md:translate-y-0"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="text-uiblack absolute left-2 top-1/2 transform -translate-y-1/2" />
        <CarouselNext className="text-uiblack absolute right-2 top-1/2 transform -translate-y-1/2" />
      </Carousel>
    </div>
  );
}
