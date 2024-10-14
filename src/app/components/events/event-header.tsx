"use client";
import { motion } from "framer-motion";

function EventHeader() {
  return (
    <header>
      <motion.h1
        className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl uppercase tracking-widest font-bold text-uiblack text-center lg:text-left mt-4"
        initial={{ opacity: 0, x: -70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Events
      </motion.h1>
    </header>
  );
}

export default EventHeader;
