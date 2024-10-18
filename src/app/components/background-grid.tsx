"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { Target, Transition, motion } from "framer-motion";

import BackgrounAnimation from "./background-animation";

type Pathnames = "/" | "/dashboard" | "/about" | "/events" | "/map" | "/search";

export interface PathnameConfig {
  box1: {
    initial: Target;
    animate: Target;
    transition: Transition;
  };
  box2: {
    initial: Target;
    animate: Target;
    transition: Transition;
  };
  box3: {
    initial: Target;
    animate: Target;
    transition: Transition;
  };
  box4: {
    initial: Target;
    animate: Target;
    transition: Transition;
  };
  triangle?: {
    initial: Target;
    animate: Target;
    transition: Transition;
  };
  extra?: {
    initial: Target;
    animate: Target;
    transition: Transition;
  };
  father?: {
    initial: Target;
    animate: Target;
    transition: Transition;
  };
}

function BackgroundGrid({}) {
  const pathname = usePathname();

  const [colors] = useState({
    box1: "#0c0c0c",
    box2: "#072f4a",
    box3: "#0086cd",
    box4: "#7dadc7",
    triangle: "#e1d237",
  });

  const rootAnimations: PathnameConfig = {
    box1: { initial: {}, animate: {}, transition: {} },
    box2: { initial: {}, animate: {}, transition: {} },
    box3: { initial: {}, animate: {}, transition: {} },
    box4: { initial: {}, animate: {}, transition: {} },
    triangle: { initial: {}, animate: {}, transition: {} },
  };

  const dashboardAnimation: PathnameConfig = {
    box1: {
      initial: { backgroundColor: "transparent", y: 500 },
      animate: { backgroundColor: colors.box3, y: 0 },
      transition: { duration: 0.8, ease: "easeInOut" },
    },
    box2: {
      initial: {},
      animate: {},
      transition: {},
    },
    box3: { initial: {}, animate: {}, transition: {} },
    box4: {
      initial: { backgroundColor: "transparent", y: -500 },
      animate: { backgroundColor: colors.box2, y: 0 },
      transition: { duration: 0.8, delay: 0.3, ease: "easeInOut" },
    },
    triangle: {
      initial: {},
      animate: { scaleY: 0 },
      transition: { duration: 0.5, ease: "easeIn" },
    },
    extra: {
      initial: {
        position: "absolute",
        inset: 0,
        backgroundColor: colors.box3,
        x: "-100vw",
      },
      animate: { x: 0 },
      transition: { delay: 1, duration: 0.6 },
    },
  };

  const aboutAnimation: PathnameConfig = {
    box1: { initial: {}, animate: {}, transition: {} },
    box2: { initial: {}, animate: {}, transition: {} },
    box3: { initial: {}, animate: {}, transition: {} },
    box4: { initial: {}, animate: {}, transition: {} },
    extra: {
      initial: {
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: `linear-gradient(to right, ${colors.box1} 50%, ${colors.box2} 50%)`,
        y: "-100vh",
      },
      animate: {
        y: 0,
      },
      transition: {
        duration: 0.8,
      },
    },
    triangle: { initial: {}, animate: {}, transition: {} },
  };

  const eventsAnimation: PathnameConfig = {
    father: {
      initial: {},
      animate: {
        translateX: "-98vw",
      },
      transition: {
        duration: 0.8,
      },
    },
    box1: { initial: {}, animate: {}, transition: {} },
    box2: {
      initial: {},
      animate: {},
      transition: {},
    },
    box3: { initial: {}, animate: {}, transition: {} },
    box4: {
      initial: {},
      animate: {},
      transition: {},
    },
    triangle: {
      initial: {},
      animate: {
        scaleY: 2.5,
      },
      transition: { duration: 0.8 },
    },
    extra: {
      initial: {
        backgroundColor: colors.triangle,
        position: "absolute",
        inset: 0,
        x: "98vw",
        zIndex: 20,
      },
      animate: {},
      transition: {},
    },
  };

  const mapAnimation: PathnameConfig = {
    box1: { initial: {}, animate: {}, transition: {} },
    box2: { initial: {}, animate: {}, transition: {} },
    box3: { initial: {}, animate: {}, transition: {} },
    box4: { initial: {}, animate: {}, transition: {} },
    triangle: { initial: {}, animate: {}, transition: {} },
    extra: {
      initial: {
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: `linear-gradient(to right, ${colors.box3} 50%, ${colors.box4} 50%)`,
        y: "100vh",
      },
      animate: {
        y: 0,
      },
      transition: {
        duration: 1,
      },
    },
  };

  const searchAnimation: PathnameConfig = {
    box1: { initial: {}, animate: {}, transition: {} },
    box2: { initial: {}, animate: {}, transition: {} },
    box3: { initial: {}, animate: {}, transition: {} },
    box4: { initial: {}, animate: {}, transition: {} },
    triangle: { initial: {}, animate: {}, transition: {} },
  };

  const animations: Record<Pathnames, PathnameConfig> = {
    "/": rootAnimations,
    "/dashboard": dashboardAnimation,
    "/about": aboutAnimation,
    "/events": eventsAnimation,
    "/map": mapAnimation,
    "/search": searchAnimation,
  };

  const { box1, box2, box3, box4, triangle, extra, father } =
    animations[pathname as Pathnames];

  return (
    <motion.div
      className={`grid grid-cols-2 grid-rows-2 h-full w-full`}
      initial={father?.initial}
      animate={father?.animate}
      transition={father?.transition}
    >
      <BackgrounAnimation box1={box1} box2={box2} box3={box3} box4={box4} />
      <motion.div
        initial={triangle?.initial}
        animate={triangle?.animate}
        transition={triangle?.transition}
        style={{ backgroundColor: colors.triangle }}
        className={`triangle`}
      />
      {extra && (
        <motion.div
          initial={extra?.initial}
          animate={extra?.animate}
          transition={extra?.transition}
        ></motion.div>
      )}
      <div style={{ backgroundColor: colors.box1 }} />
      <div style={{ backgroundColor: colors.box2 }} />
      <div style={{ backgroundColor: colors.box3 }} />
      <div style={{ backgroundColor: colors.box4 }} />
    </motion.div>
  );
}

export default BackgroundGrid;
