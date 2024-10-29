"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Gletter from "@/app/components/logo-components/g-letter";
import Lletter from "@/app/components/logo-components/l-letter";
import Eletter from "@/app/components/logo-components/e-letter";
import Uletter from "@/app/components/logo-components/u-letter";
import { useEffect, useState } from "react";

interface LogoMainProps {
  mode: "home" | "member";
}

function LogoMain({ mode }: LogoMainProps) {
  const pathname = usePathname();
  const [isMainRoute, setIsMainRoute] = useState(true);

  useEffect(() => {
    setIsMainRoute(pathname === "/");
  }, [pathname]);

  const mainRouteVariants = {
    initial: { scale: 0.2, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
    },
    exit: {
      scale: 0.2,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const otherRouteVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: 0.2,
      opacity: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isMainRoute ? "main" : "other"}
        variants={isMainRoute ? mainRouteVariants : otherRouteVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-20 flex justify-center items-center mix-blend-lighten"
      >
        <LogoLetters mode={mode} />
        <Lines />
      </motion.div>
    </AnimatePresence>
  );
}

function Lines() {
  return (
    <div className="absolute w-full h-[80%]">
      <div className="absolute inset-0 w-[90%] m-auto h-[90%]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          vectorEffect="non-scaling-stroke"
          className="absolute overflow-visible"
        >
          <polygon
            points="0 0, 100 0, 0 100, 100 100"
            className="stroke-white"
            strokeWidth="0.2"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

function LogoLetters({ mode }: LogoMainProps) {
  return (
    <div className="absolute z-20 w-[95%] h-[90%]">
      <div className="h-full relative">
        <Gletter
          className={`
          ${mode == "home" && "homeLogoLetter "}
          ${mode == "member" && "memberLogoLetter "}
            top-0 left-0`}
        />
        <Lletter
          className={`
    ${mode == "home" && "homeLogoLetter"}
    ${mode == "member" && "memberLogoLetter"}
    top-0 right-0
  `}
        />
        <Uletter
          className={`
    ${mode == "home" && "homeLogoLetter"}
    ${mode == "member" && "memberLogoLetter"}
    bottom-0 left-0
  `}
        />
        <Eletter
          className={`
    ${mode == "home" && "homeLogoLetter"}
    ${mode == "member" && "memberLogoLetter"}
    bottom-0 right-0
  `}
        />
      </div>
    </div>
  );
}

export default LogoMain;
