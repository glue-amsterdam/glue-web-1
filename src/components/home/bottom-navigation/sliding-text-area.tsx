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

  const repeatedItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="w-full overflow-hidden border-t border-(--black-color) lg:border-t-2 bg-(--background-color) h-[40px] py-2 hidden md:block">
      <div className="flex w-max animate-marquee gap-[50px] will-change-transform">
        {repeatedItems.map((item, index) => (
          <HomeTextItemDisplay
            key={`${item.id}-${index}`}
            item={item}
            defaultColorClassName="text-[var(--primary-color)] whitespace-nowrap text-[23px] leading-[29px] font-[400]"
          />
        ))}
      </div>
    </div>
  );
};

export default SlidingTextArea;
