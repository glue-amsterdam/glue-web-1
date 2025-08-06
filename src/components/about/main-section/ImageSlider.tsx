import { CarouselClientType } from "@/schemas/carouselSchema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { NoDataAvailable } from "@/app/components/no-data-available";
import MainHeroDialog from "./MainHeroDialog";
import { CarouselPrevious } from "./CarouselPrevious";
import { CarouselNext } from "./CarouselNext";

export default function ImageSlider({
  slides,
  ref,
}: {
  slides: CarouselClientType["slides"];
  ref: React.RefObject<HTMLDivElement>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const autoplay = useRef(
    Autoplay({
      delay: 6000,
      stopOnInteraction: false,
    })
  );

  useEffect(() => {
    if (modalOpen) {
      autoplay.current.stop();
    } else {
      autoplay.current.reset();
    }
  }, [modalOpen]);

  if (slides.length <= 0) return <NoDataAvailable />;
  return (
    <Carousel
      className="absolute inset-0 overflow-hidden"
      ref={ref}
      plugins={[autoplay.current]}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent className="h-full">
        {slides.map((slide, index) => (
          <CarouselItem className="h-full" key={index}>
            <Card className="border-none bg-transparent h-full">
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full">
                  <Image
                    src={slide.image_url || "/placeholder.svg"}
                    alt={`Slide number ${index} from the GLUE Gallery`}
                    className="absolute inset-0 w-full h-full object-cover"
                    quality={85}
                    width={1920}
                    height={1080}
                    onClick={() => {
                      setSelectedImage(index);
                      setModalOpen(true);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      {!modalOpen && (
        <>
          <CarouselPrevious className="mix-blend-exclusion absolute left-0 top-1/2 -translate-y-1/2 hover:scale-105 transition-all duration-300  " />
          <CarouselNext className="mix-blend-exclusion absolute right-0 top-1/2 -translate-y-1/2 hover:scale-105 transition-all duration-300 " />
        </>
      )}
      <MainHeroDialog
        slides={slides}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </Carousel>
  );
}
