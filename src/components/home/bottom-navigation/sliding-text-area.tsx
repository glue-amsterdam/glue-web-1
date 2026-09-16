"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { HomeTextItem } from "@/schemas/mainSchema";
import HomeTextItemDisplay from "./home-text-item";

type SlidingTextAreaProps = {
  marqueeItems: HomeTextItem[];
};

const INITIAL_SEQUENCE_REPEATS = 2;

const SlidingTextArea = ({ marqueeItems }: SlidingTextAreaProps) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const containerRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const [sequenceRepeatCount, setSequenceRepeatCount] = useState(
    INITIAL_SEQUENCE_REPEATS,
  );

  useEffect(() => {
    const container = containerRef.current;
    const sequence = sequenceRef.current;

    if (!container || !sequence) return;

    const updateSequenceRepeatCount = () => {
      const sequenceWidth = sequence.getBoundingClientRect().width;

      if (sequenceWidth === 0) return;

      const requiredRepeatCount = Math.max(
        1,
        Math.ceil(container.clientWidth / sequenceWidth),
      );

      setSequenceRepeatCount((currentRepeatCount) =>
        currentRepeatCount === requiredRepeatCount
          ? currentRepeatCount
          : requiredRepeatCount,
      );
    };

    updateSequenceRepeatCount();

    const resizeObserver = new ResizeObserver(updateSequenceRepeatCount);
    resizeObserver.observe(container);
    resizeObserver.observe(sequence);

    return () => resizeObserver.disconnect();
  }, [isHomePage, marqueeItems]);

  if (!isHomePage || marqueeItems.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="hidden h-10 w-full overflow-hidden border-t border-(--black-color) bg-(--background-color) py-2 lg:block lg:border-t-2"
    >
      <div className="flex w-max animate-marquee will-change-transform">
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="flex shrink-0"
            aria-hidden={groupIndex === 1}
          >
            {Array.from({ length: sequenceRepeatCount }, (_, repeatIndex) => (
              <div
                ref={
                  groupIndex === 0 && repeatIndex === 0
                    ? sequenceRef
                    : undefined
                }
                key={`${groupIndex}-${repeatIndex}`}
                className="flex shrink-0 gap-12.5 pr-12.5"
                aria-hidden={groupIndex === 1 || repeatIndex > 0}
                inert={groupIndex === 1 || repeatIndex > 0}
              >
                {marqueeItems.map((item) => (
                  <HomeTextItemDisplay
                    key={`${groupIndex}-${repeatIndex}-${item.id}`}
                    item={item}
                    mode="marquee"
                    defaultColorClassName="whitespace-nowrap text-[var(--primary-color)]"
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidingTextArea;
