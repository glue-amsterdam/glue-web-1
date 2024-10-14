"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function LogoMain() {
  const pathname = usePathname();

  const variables = {
    initial: { scale: 0.2, opacity: 0 },
    animate: {
      scale: pathname == "/" ? 1 : 0,
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
        className="mix-blend-lighten z-10 fixed inset-0 flex justify-center items-center pointer-events-none"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <LogoLetters />
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

function LogoLetters() {
  return (
    <div className="absolute z-10 w-[95%] h-[90%]">
      <div className="h-full relative">
        <img
          src="logos/GLUE_G.svg"
          alt="G"
          className="mainLogoLetter top-0 left-0"
        />
        <img
          src="logos/GLUE_L.svg"
          alt="L"
          className="mainLogoLetter top-0 right-0"
        />
        <img
          src="logos/GLUE_U.svg"
          alt="U"
          className="mainLogoLetter bottom-0 left-0"
        />
        <img
          src="logos/GLUE_E.svg"
          alt="E"
          className="mainLogoLetter bottom-0 right-0"
        />
      </div>
    </div>
  );
}

export default LogoMain;
