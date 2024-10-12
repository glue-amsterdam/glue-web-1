"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PressItem } from "@/utils/about-types";
import { motion } from "framer-motion";

interface PressSectionProps {
  pressItems: PressItem[];
}

export default function PressSection({ pressItems }: PressSectionProps) {
  const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);

  const PressCard = ({ item }: { item: PressItem }) => (
    <Card
      className="cursor-pointer rounded-none border-none group"
      onClick={() => setSelectedItem(item)}
    >
      <CardContent className="p-0">
        <div className="relative w-full h-[20vh] md:h-[50vh] lg:h-[60vh] overflow-hidden transition-all">
          <img
            src={item.image}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const hasGlueTV = pressItems.some((item) => item.title === "GLUE TV");

  return (
    <section aria-labelledby="press-heading" className="space-y-4 mt-[15vh]">
      <motion.h2
        id="press-heading"
        className="text-5xl md:text-7xl uppercase tracking-widest font-bold text-[#2b2b2b]"
        initial={{ opacity: 0, x: 70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
      >
        Press
      </motion.h2>
      <div
        className={`grid gap-4 ${
          hasGlueTV
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {pressItems.map((item) => (
          <PressCard key={item.id} item={item} />
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <div className="relative w-full h-64 mb-4">
              <img
                src={selectedItem?.image}
                alt={selectedItem?.title}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            <p className="text-base text-muted-foreground">
              {selectedItem?.description}
            </p>
            {selectedItem?.content && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">
                  Additional Information
                </h4>
                <p>{selectedItem.content}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
