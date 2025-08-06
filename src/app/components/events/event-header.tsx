"use client";
import { fadeInConfig } from "@/utils/animations";
import { motion } from "framer-motion";

function EventHeader() {
  return (
    <motion.header {...fadeInConfig}>
      <motion.h1
        className="h1-titles uppercase py-4"
        initial={{ opacity: 0, x: -70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Events
      </motion.h1>
    </motion.header>
  );
}

export default EventHeader;
