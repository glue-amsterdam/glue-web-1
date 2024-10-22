"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PressItem } from "@/utils/about-types";
import { motion } from "framer-motion";

interface PressSectionProps {
  pressItems: PressItem[];
}

export default function PressSection({ pressItems }: PressSectionProps) {
  const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);
  const hasAnimatedRef = useRef(false);

  const PressCard = ({ item, i }: { item: PressItem; i: number }) => {
    const xSide = i === 0 ? -100 : 100;
    const ySide = i === 0 ? -100 : 100;
    const rotateSide = i === 0 ? -20 : 20;

    return (
      <motion.section
        id="press"
        initial={{
          x: hasAnimatedRef.current ? 0 : xSide,
          y: hasAnimatedRef.current ? 0 : ySide,
          opacity: hasAnimatedRef.current ? 1 : 0,
          rotate: hasAnimatedRef.current ? 0 : rotateSide,
        }}
        whileInView={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative shadow-md overflow-hidden"
        onViewportEnter={() => (hasAnimatedRef.current = true)}
      >
        <Card
          className="cursor-pointer rounded-none border-none group shadow-md"
          onClick={() => setSelectedItem(item)}
        >
          <img
            src={item.image}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute bg-uiblack/50 w-full text-uiwhite py-4 duration-300 group-hover:py-12 transition-all">
            <h3 className="font-bold text-xl tracking-wider lg:text-3xl mb-2 text-center">
              {item.title}
            </h3>
          </div>
        </Card>
      </motion.section>
    );
  };

  const hasGlueTV = pressItems.some((item) => item.title === "GLUE TV");

  return (
    <section aria-labelledby="press-heading" className="section-container">
      <div className="screen-size">
        <motion.h2
          id="press-heading"
          className="h2-titles"
          initial={{ opacity: 0, x: 70 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          Press
        </motion.h2>
        <div
          className={`grid gap-6 h-[80%] lg:h-[70%] ${
            hasGlueTV ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 "
          }`}
        >
          {pressItems.map((item, index) => (
            <PressCard key={item.id} i={index} item={item} />
          ))}
        </div>

        <Dialog
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
        >
          <DialogContent className="max-w-3xl text-uiblack m-0 p-0">
            <div className="relative w-full h-[70vh] overflow-hidden group">
              <img
                src={selectedItem?.image}
                alt={selectedItem?.title}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div
                id="dialog"
                className="absolute z-20 bottom-0 left-0 right-0 bg-uiwhite p-6 transition-all duration-300 ease-in-out md:opacity-0 md:group-hover:opacity-100"
              >
                <DialogTitle className="text-xl md:text-3xl">
                  {selectedItem?.title}
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
      </div>
    </section>
  );
}
