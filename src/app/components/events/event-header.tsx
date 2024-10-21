"use client";
import { motion } from "framer-motion";

function EventHeader() {
  return (
    <header>
      <motion.h1
        className="h2-titles text-uiblack"
        initial={{ opacity: 0, x: -70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Events
      </motion.h1>
    </header>
  );
}

export default EventHeader;