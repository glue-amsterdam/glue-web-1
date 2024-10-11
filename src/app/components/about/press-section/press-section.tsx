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

interface PressSectionProps {
  pressItems: PressItem[];
}

export default function PressSection({ pressItems }: PressSectionProps) {
  const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);

  const PressCard = ({ item }: { item: PressItem }) => (
    <Card className="cursor-pointer" onClick={() => setSelectedItem(item)}>
      <CardContent className="p-0">
        <div className="relative w-full h-40">
          <img
            src={item.image}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
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
    <div className="space-y-4">
      <h2 id="press-heading" className="text-3xl font-bold mb-6">
        Press
      </h2>

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
    </div>
  );
}
