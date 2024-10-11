"use client";

import { Button } from "@/components/ui/button";
import { GlueInternationalContent } from "@/utils/about-types";

interface GlueInternationalProps {
  content: GlueInternationalContent;
}

export default function GlueInternational({ content }: GlueInternationalProps) {
  return (
    <div className="space-y-4">
      <h2 id="glue-international-heading" className="text-3xl font-bold mb-6">
        {content.title}
      </h2>
      <Button asChild className="w-full py-6 text-lg">
        <a href={content.website} target="_blank" rel="noopener noreferrer">
          {content.buttonText}
        </a>
      </Button>
    </div>
  );
}
