"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { CarouselSectionContent } from "@/schemas/baseSchema";

interface MainSectionProps {
  mainSection: CarouselSectionContent | undefined;
}

export default function MainSection({ mainSection }: MainSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  if (!mainSection) return <div className="text-center py-8">No Data</div>;

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
        className="z-20 mx-auto container h-full flex flex-col justify-between relative "
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
          {mainSection.title}
        </motion.h1>
        <div className="flex-grow h-full">
          <Carousel
            className="w-full h-full"
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
          >
            <CarouselContent className="h-full">
              {mainSection.slides.map((slide, index) => (
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
                          src={slide.imageUrl}
                          alt={slide.alt || "Slide from the GLUE Gallery"}
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
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="opacity-90 mt-4 text-md md:text-lg"
        >
          {mainSection.description}
        </motion.p>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="w-full p-0 max-w-[90vw] md:max-w-[70vw] ">
            <div className="relative w-full h-full">
              <img
                src={mainSection.slides[selectedImage].imageUrl}
                alt={
                  mainSection.slides[selectedImage].alt ||
                  "Slide from the GLUE Gallery"
                }
                className="object-cover w-full h-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
                onClick={() =>
                  setSelectedImage(
                    (prev) =>
                      (prev - 1 + mainSection.slides.length) %
                      mainSection.slides.length
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
                    (prev) => (prev + 1) % mainSection.slides.length
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
