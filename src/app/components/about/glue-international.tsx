"use client";

import { GlueInternationalContent } from "@/utils/about-types";
import { GiWorld } from "react-icons/gi";
import { motion } from "framer-motion";
import Link from "next/link";

interface GlueInternationalProps {
  glueInternational: GlueInternationalContent;
}

export default function GlueInternational({
  glueInternational,
}: GlueInternationalProps) {
  const { buttonColor, buttonText, subtitle, title, website } =
    glueInternational;
  return (
    <motion.div
      style={{ backgroundColor: buttonColor }}
      initial={{ x: 80, y: 20 }}
      whileInView={{ x: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full md:w-[80%] mx-auto rounded-lg"
    >
      <motion.div
        initial={{ x: -120, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex py-4 flex-col bg-uiwhite text-uiblack w-[70%] rounded-lg shadow-md mx-auto border border-uiblack"
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
            className="h1-titles font-bold tracking-widest"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="opacity-90 mt-4 text-md md:text-lg"
          >
            {subtitle}
          </motion.p>
        </div>

        <Link
          style={{ backgroundColor: buttonColor }}
          href={website}
          target="_blank"
          className="hover:scale-110 rounded-md py-2 mx-auto flex items-center justify-center text-uiwhite transition duration-500 w-[80%]"
        >
          <GiWorld className="size-12 px-2" />
          <p className="text-center px-2">{buttonText}</p>
        </Link>
      </motion.div>
    </motion.div>
  );
}
