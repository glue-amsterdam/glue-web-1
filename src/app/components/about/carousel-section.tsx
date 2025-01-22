"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import ScrollDown from "@/app/components/scroll-down";
import { useScroll } from "@/app/hooks/useScroll";
import { fadeInConfig } from "@/utils/animations";
import { NAVBAR_HEIGHT } from "@/constants";
import { NoDataAvailable } from "@/app/components/no-data-available";
import { CarouselClientType } from "@/schemas/carouselSchema";

interface MainSectionProps {
  carouselData: CarouselClientType | undefined;
}

export default function CarouselSection({ carouselData }: MainSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  if (!carouselData)
    return <div className="text-center py-8">No Carousel Data</div>;

  if (!carouselData.is_visible) {
    return null;
  }

  if (carouselData.slides.length <= 0) return <NoDataAvailable />;

  return (
    <section
      ref={sectionRef}
      id="main"
      aria-labelledby="press-heading"
      aria-label="main-content"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh snap-start relative `}
    >
      <motion.article
        {...fadeInConfig}
        className="z-20 mx-auto about-w h-full flex flex-col justify-between relative "
      >
        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.8,
          }}
          viewport={{ once: true }}
          className="h1-titles font-bold tracking-widest my-4"
        >
          {carouselData.title}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-4 text-sm md:text-base lg:text-lg"
        >
          {carouselData.description}
        </motion.p>
        <div className="flex-grow h-full">
          <Carousel
            className="w-[90%] h-full mx-auto"
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
          >
            <CarouselContent className="h-full">
              {carouselData.slides.map((slide, index) => (
                <CarouselItem className="h-full" key={index}>
                  <Card className="border-none bg-transparent h-full">
                    <CardContent className="p-0 h-full">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="relative w-full h-full cursor-pointer transition-transform hover:scale-105"
                      >
                        <Image
                          src={slide.image_url}
                          alt={`Slide number ${index} from the GLUE Gallery`}
                          className="object-cover"
                          quality={100}
                          fill
                          onClick={() => {
                            setSelectedImage(index);
                            setModalOpen(true);
                          }}
                        />
                      </motion.div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex text-uiblack" />
            <CarouselNext className="hidden md:flex text-uiblack" />
          </Carousel>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="w-full p-0 h-full max-h-[90%] max-w-[90vw] md:max-w-[70vw] ">
            <DialogTitle className="sr-only">
              Photo galery from the GLUE desing route
            </DialogTitle>
            <div className="relative w-full h-full">
              <Image
                src={carouselData.slides[selectedImage].image_url}
                alt={"Slide from the GLUE Gallery"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 80vw"
                className="object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
                onClick={() =>
                  setSelectedImage(
                    (prev) =>
                      (prev - 1 + carouselData.slides.length) %
                      carouselData.slides.length
                  )
                }
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
                onClick={() =>
                  setSelectedImage(
                    (prev) => (prev + 1) % carouselData.slides.length
                  )
                }
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ScrollDown color="uiwhite" href="#participants" className="py-2" />
      </motion.article>
    </section>
  );
}
