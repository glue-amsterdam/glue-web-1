import React from "react";
import { motion } from "framer-motion";
import { PathnameConfig } from "./background-grid";

export default function BackgrounAnimation({
  box1,
  box2,
  box3,
  box4,
}: PathnameConfig) {
  return (
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
      <motion.div
        initial={box1.initial}
        animate={box1.animate}
        transition={box1.transition}
      />
      <motion.div
        initial={box2.initial}
        animate={box2.animate}
        transition={box2.transition}
      />
      <motion.div
        initial={box3.initial}
        animate={box3.animate}
        transition={box3.transition}
      />
      <motion.div
        initial={box4.initial}
        animate={box4.animate}
        transition={box4.transition}
      />
    </div>
  );
}
