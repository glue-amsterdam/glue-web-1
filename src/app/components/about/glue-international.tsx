"use client";

import { GiWorld } from "react-icons/gi";
import { motion } from "framer-motion";
import Link from "next/link";
import { GlueInternationalContent } from "@/schemas/internationalSchema";

export default function GlueInternational({
  glueInternational,
}: {
  glueInternational: GlueInternationalContent;
}) {
  const { button_color, button_text, subtitle, title, website } =
    glueInternational;

  return (
    <motion.div
      style={{ backgroundColor: button_color }}
      initial={{ x: 80, y: 20 }}
      whileInView={{ x: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="w-full mx-auto rounded-lg flex flex-col h-full items-center justify-center p-1 md:p-4"
    >
      <motion.div
        initial={{ x: -120, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="py-4 h-full flex flex-col justify-center bg-uiwhite text-uiblack w-full rounded-lg shadow-md mx-auto border border-uiblack"
      >
        <div className="mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.8,
            }}
            viewport={{ once: true }}
            className="h1-titles font-bold tracking-widest text-2xl md:text-4xl lg:text-6xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            viewport={{ once: true }}
            className="opacity-90 mt-4 text-md md:text-xl lg:text-2xl"
          >
            {subtitle}
          </motion.p>
        </div>
        <Link
          style={{ backgroundColor: button_color }}
          href={website}
          target="_blank"
          className="hover:scale-110 rounded-md py-2 mt-4 mx-auto flex items-center justify-center text-uiwhite transition duration-500 w-[80%]"
        >
          <GiWorld className="size-8 md:size-12 px-2" />
          <p className="text-center px-2 text-sm md:text-base">{button_text}</p>
        </Link>
      </motion.div>
    </motion.div>
  );
}
