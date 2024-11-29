import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

function AboutTabList() {
  return (
    <TabsList className="flex h-full flex-wrap gap-2 overflow-x-auto text-white">
      <TabsTrigger
        value="carousel"
        className="text-xs sm:text-sm bg-[var(--color-box4)] hover:scale-105 transition-all"
      >
        Carousel
      </TabsTrigger>
      <TabsTrigger
        value="participants"
        className="text-xs sm:text-sm bg-[var(--color-box4)] hover:scale-105 transition-all"
      >
        Participants
      </TabsTrigger>
      <TabsTrigger
        value="citizens"
        className="text-xs sm:text-sm bg-[var(--color-box4)] hover:scale-105 transition-all"
      >
        Citizens
      </TabsTrigger>
      <TabsTrigger
        value="curated"
        className="text-xs sm:text-sm bg-[var(--color-box4)] hover:scale-105 transition-all"
      >
        Curated
      </TabsTrigger>
      <TabsTrigger
        value="info"
        className="text-xs sm:text-sm bg-[var(--color-box4)] hover:scale-105 transition-all"
      >
        Info
      </TabsTrigger>
      <TabsTrigger
        value="press"
        className="text-xs sm:text-sm bg-[var(--color-box4)] hover:scale-105 transition-all"
      >
        Press
      </TabsTrigger>
      <TabsTrigger
        value="international"
        className="text-xs sm:text-sm bg-[var(--color-box4)] hover:scale-105 transition-all"
      >
        International
      </TabsTrigger>
      <TabsTrigger
        value="sponsors"
        className="text-xs sm:text-sm bg-[var(--color-box4)] hover:scale-105 transition-all"
      >
        Sponsors
      </TabsTrigger>
    </TabsList>
  );
}

export default AboutTabList;
