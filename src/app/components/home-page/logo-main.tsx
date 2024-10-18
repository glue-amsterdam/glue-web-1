"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface LogoMainProps {
  mode: "home" | "member";
}

function LogoMain({ mode }: LogoMainProps) {
  const pathname = usePathname();

  const variables = {
    initial: { scale: 0.2, opacity: 0 },
    animate: {
      scale: pathname == "/" || pathname.startsWith("/members") ? 1 : 0,
      opacity: 1,
      transition: { delay: 0.2 },
    },
    exit: { scale: 1, opacity: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variables}
        className={`
          ${mode === "home" && "fixed"}
          ${mode === "member" && "absolute"}
          mix-blend-lighten z-10 inset-0 flex justify-center items-center pointer-events-none
          `}
        initial="initial"
        animate="animate"
        exit="exit"
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
    <div className="absolute z-10 w-[95%] h-[90%]">
      <div className="h-full relative">
        <img
          src="/logos/glue-g.svg"
          alt="G"
          className={`
          ${mode == "home" && "homeLogoLetter "}
          ${mode == "member" && "memberLogoLetter "}
            top-0 left-0`}
        />
        <img
          src="/logos/glue-l.svg"
          alt="L"
          className={`
    ${mode == "home" && "homeLogoLetter"}
    ${mode == "member" && "memberLogoLetter"}
    top-0 right-0
  `}
        />
        <img
          src="/logos/glue-u.svg"
          alt="U"
          className={`
    ${mode == "home" && "homeLogoLetter"}
    ${mode == "member" && "memberLogoLetter"}
    bottom-0 left-0
  `}
        />
        <img
          src="/logos/glue-e.svg"
          alt="E"
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
