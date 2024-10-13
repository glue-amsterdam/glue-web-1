"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MainSectionContent } from "@/utils/about-types";
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

interface MainSectionProps {
  content: MainSectionContent | undefined;
}

export default function MainSection({ content }: MainSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!content) return <div className="text-center py-8">No Data</div>;

  return (
    <section className="container mx-auto mt-[15vh]" aria-label="Main content">
      <header className="my-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.5,
          }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl xl:text-7xl font-bold mb-2 tracking-wide"
        >
          {content.title}
        </motion.h1>
      </header>
      <Carousel
        className="w-full max-w-6xl mx-auto"
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
      >
        <CarouselContent>
          {content.slides.map((slide, index) => (
            <CarouselItem key={index}>
              <Card className="border-none bg-transparent">
                <CardContent className="p-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="relative w-full h-[500px] lg:h-[550px] cursor-pointer transition-transform hover:scale-105"
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
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
        <CarouselPrevious className="hidden md:flex text-black" />
        <CarouselNext className="hidden md:flex text-black" />
      </Carousel>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="opacity-90 text-center mt-4 text-lg"
      >
        {content.description}
      </motion.p>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full p-0 max-w-[90vw] md:max-w-[70vw] ">
          <div className="relative w-full h-full">
            <img
              src={content.slides[selectedImage].src}
              alt={content.slides[selectedImage].alt}
              className="object-cover w-full h-full"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
              onClick={() =>
                setSelectedImage(
                  (prev) =>
                    (prev - 1 + content.slides.length) % content.slides.length
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
                setSelectedImage((prev) => (prev + 1) % content.slides.length)
              }
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
