"use client";

import React from "react";
import { FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useScroll } from "@/app/hooks/useScroll";

type Props = {
  color: "uiwhite" | "uiblack";
  href: string;
  className?: string;
  delay?: number;
};

export default function ScrollDown({ color, href, className, delay }: Props) {
  const scrollToElement = useScroll(delay);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const id = href.slice(1);
    scrollToElement(id);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={twMerge(
        `text-${color} w-full z-20 flex justify-center relative flex-col items-center md:hover:scale-105 md:transition-all`,
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.8,
        }}
        viewport={{ once: true }}
        className="z-10"
      >
        <FaChevronUp size={24} className={`text-4xl animate-ping-slow`} />
      </motion.div>
      <p className="text-sm tracking-[0.4rem]">Scroll Up</p>
      <div
        className={`absolute inset-0 bg-gradient-to-b from-transparent blur-md to-${color} z-20 opacity-5`}
      ></div>
    </Link>
  );
}
