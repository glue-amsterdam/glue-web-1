"use client";

import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

type Props = {
  color: "uiwhite" | "uiblack";
  href: string;
  className?: string;
};

function ScrollDown({ color, href, className }: Props) {
  return (
    <a
      href={href}
      className={twMerge(
        `text-${color} w-full z-20 flex justify-center relative flex-col items-center `,
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
        <FaChevronDown size={24} className={`text-4xl animate-ping-slow`} />
      </motion.div>
      <p className="text-sm tracking-[0.4rem]">Scroll down</p>
      <div
        className={`absolute inset-0 bg-gradient-to-b from-transparent blur-md to-${color} z-20 opacity-5`}
      ></div>
    </a>
  );
}

export default ScrollDown;
