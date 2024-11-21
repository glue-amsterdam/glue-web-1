import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

function AboutTabList() {
  return (
    <TabsList className="flex flex-wrap gap-2 overflow-x-auto">
      <TabsTrigger value="carousel" className="text-xs sm:text-sm">
        Carousel
      </TabsTrigger>
      <TabsTrigger value="participants" className="text-xs sm:text-sm">
        Participants
      </TabsTrigger>
      <TabsTrigger value="citizens" className="text-xs sm:text-sm">
        Citizens
      </TabsTrigger>
      <TabsTrigger value="curated" className="text-xs sm:text-sm">
        Curated
      </TabsTrigger>
      <TabsTrigger value="info" className="text-xs sm:text-sm">
        Info
      </TabsTrigger>
      <TabsTrigger value="press" className="text-xs sm:text-sm">
        Press
      </TabsTrigger>
      <TabsTrigger value="international" className="text-xs sm:text-sm">
        International
      </TabsTrigger>
      <TabsTrigger value="sponsors" className="text-xs sm:text-sm">
        Sponsors
      </TabsTrigger>
    </TabsList>
  );
}

export default AboutTabList;
