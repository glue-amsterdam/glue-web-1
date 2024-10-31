"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PressItem } from "@/utils/about-types";
import { motion } from "framer-motion";
import ScrollDown from "@/app/components/scroll-down";
import { fadeInConfig } from "@/utils/animations";

interface PressSectionProps {
  pressItems: PressItem[];
  title: string;
  description: string;
}

export default function PressSection({
  pressItems,
  title,
  description,
}: PressSectionProps) {
  const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);
  const hasAnimatedRef = useRef(false);

  const PressCard = ({ item, i }: { item: PressItem; i: number }) => {
    const xSide = i === 0 ? -100 : 100;
    const ySide = i === 0 ? -100 : 100;
    const rotateSide = i === 0 ? -20 : 20;

    return (
      <motion.div
        initial={{
          x: hasAnimatedRef.current ? 0 : xSide,
          y: hasAnimatedRef.current ? 0 : ySide,
          opacity: hasAnimatedRef.current ? 1 : 0,
          rotate: hasAnimatedRef.current ? 0 : rotateSide,
        }}
        whileInView={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative shadow-md overflow-hidden h-full"
        onViewportEnter={() => (hasAnimatedRef.current = true)}
      >
        <Card
          className="cursor-pointer rounded-none border-none group shadow-md"
          onClick={() => setSelectedItem(item)}
        >
          <img
            src={item.image.imageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute bg-uiblack/50 w-full text-uiwhite py-4 duration-300 group-hover:py-12 transition-all">
            <h3 className="font-bold text-xl lg:text-3xl tracking-wider mb-2 text-center">
              {item.title}
            </h3>
          </div>
        </Card>
      </motion.div>
    );
  };

  const hasGlueTV = pressItems.length <= 2;

  return (
    <motion.article
      {...fadeInConfig}
      className="z-20 mx-auto container h-full flex flex-col justify-between relative"
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
        {title}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-4 text-md md:text-lg text-uiwhite flex-grow-[0.3]"
      >
        {description}
      </motion.p>
      <div
        className={`grid grid-cols-1 gap-6 h-[80%] ${
          hasGlueTV && "md:grid-cols-2"
        }`}
      >
        {pressItems.map((item, index) => (
          <PressCard key={item.id} i={index} item={item} />
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="text-uiblack min-w-[80vw] rounded-none m-0 p-0">
          <div className="relative w-full h-[400px] md:h-[70vh] group">
            <img
              src={selectedItem?.image.imageUrl}
              alt={selectedItem?.title}
              className="absolute inset-0 w-full h-full object-cover rounded-lg mb-4"
            />
            <div
              id="dialog"
              className="absolute z-20 bottom-0 left-0 right-0 bg-uiwhite p-6 transition-all duration-300 ease-in-out md:opacity-0 md:group-hover:opacity-100"
            >
              <DialogTitle>
                <h4 className="text-xl md:text-3xl">{selectedItem?.title}</h4>
              </DialogTitle>
              <p className="text-sm md:text-base mt-2">
                {selectedItem?.description}
              </p>
              {selectedItem?.content && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-4xl">
                    Additional Information
                  </h4>
                  <p>{selectedItem.content}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ScrollDown color="uiblack" href="#last" className="py-2" />
    </motion.article>
  );
}
