"use client";

import { usePathname } from "next/navigation";

import type { HomeTextItem } from "@/schemas/mainSchema";
import HomeTextItemDisplay from "./home-text-item";

type SlidingTextAreaProps = {
  marqueeItems: HomeTextItem[];
};

const SlidingTextArea = ({ marqueeItems }: SlidingTextAreaProps) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (!isHomePage || marqueeItems.length === 0) return null;

  return (
    <div className="w-full overflow-hidden border-t border-(--black-color) lg:border-t-2 bg-(--background-color) h-[40px] py-2 hidden lg:block ">
      <div className="flex w-max animate-marquee will-change-transform">
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="flex shrink-0 gap-[50px] pr-[50px]"
            aria-hidden={groupIndex === 1}
          >
            {marqueeItems.map((item) => (
              <HomeTextItemDisplay
                key={`${groupIndex}-${item.id}`}
                item={item}
                mode="marquee"
                defaultColorClassName="text-[var(--primary-color)] whitespace-nowrap"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidingTextArea;
