"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function BackButton() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <motion.button
      onClick={() => router.back()}
      className="absolute left-[20%] lg:left-[10%]"
      initial={{
        opacity: 0,
        x: -100,
      }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <p className="flex gap-2 text-2xl group">
        <span className="group-hover:translate-x-1 transition-all duration-500">{`<`}</span>
        <span className="group-hover:underline transition-all duration-500">
          back
        </span>
      </p>
    </motion.button>
  );
}

export default BackButton;
