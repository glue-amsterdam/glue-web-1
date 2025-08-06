import React from "react";

export default function CuratedStickyHeader({
  sanitizedTitle,
  sanitizedDescription,
  textColor,
}: {
  textColor: string;
  sanitizedTitle: string;
  sanitizedDescription: string;
}) {
  return (
    <div id="curated-title-description" className="relative z-10 pb-2">
      <h2
        id="curated-title"
        className="about-title text-3xl md:text-5xl lg:text-6xl xl:text-7xl px-2"
        style={{ color: textColor }}
        dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
      />
      <p
        id="curated-description"
        className="about-description text-xs md:text-sm lg:text-base px-4"
        style={{ color: textColor }}
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
      />
    </div>
  );
}
