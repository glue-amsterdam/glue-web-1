"use client";

import Image from "next/image";
import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

export type PreloadedImageSlide = {
  id: string;
  src: string | null;
  alt: string;
};

type Props = {
  slides: PreloadedImageSlide[];
  currentIndex: number;
  onAdvance?: () => void;
  className?: string;
  sizes?: string;
  align?: "center" | "start";
  objectFit?: "cover" | "contain";
  objectPosition?: "center" | "top";
  fullWidth?: boolean;
};

const DEFAULT_SIZES = "(max-width: 768px) 100vw, 50vw";

const handleKeyDown = (
  event: KeyboardEvent<HTMLButtonElement>,
  onAdvance: () => void
) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  onAdvance();
};

const PreloadedImageStack = ({
  slides,
  currentIndex,
  onAdvance,
  className,
  sizes = DEFAULT_SIZES,
  align = "center",
  objectFit = "cover",
  objectPosition = "center",
  fullWidth = false,
}: Props) => {
  const stack = (
    <div className={cn("relative", className)}>
      {slides.map((slide, index) => {
        const visibility =
          index === currentIndex ? "visible z-10" : "invisible z-0";

        if (!slide.src) {
          return (
            <div
              key={slide.id}
              className={cn("absolute inset-0", visibility)}
              aria-hidden
            />
          );
        }

        return (
          <Image
            key={slide.id}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes={sizes}
            priority={index === 0}
            loading={index === 0 ? undefined : "eager"}
            className={cn(
              "absolute inset-0",
              objectFit === "contain" ? "object-contain" : "object-cover",
              objectPosition === "top" ? "object-top" : "object-center",
              visibility
            )}
          />
        );
      })}
    </div>
  );

  if (!onAdvance) {
    return stack;
  }

  return (
    <button
      type="button"
      aria-label="Next image"
      onClick={onAdvance}
      onKeyDown={(event) => handleKeyDown(event, onAdvance)}
      className={cn(
        "block cursor-pointer border-0 bg-transparent p-0",
        fullWidth && "w-full",
        align === "center" && "mx-auto"
      )}
    >
      {stack}
    </button>
  );
};

export default PreloadedImageStack;
