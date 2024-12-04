"use client";
import { usePathname } from "next/navigation";
import { Target, Transition, motion } from "framer-motion";
import BackgrounAnimation from "./background-animation";
import { useColors } from "../context/MainContext";

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
  const mainColors = useColors();

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
      animate: { backgroundColor: mainColors?.box3, y: 0 },
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
      animate: { backgroundColor: mainColors?.box2, y: 0 },
      transition: { duration: 0.8, delay: 0.3, ease: "easeInOut" },
    },
    triangle: {
      initial: {},
      animate: { scaleY: 0 },
      transition: { duration: 0.8, ease: "easeIn" },
    },
    extra: {
      initial: {
        position: "absolute",
        inset: 0,
        backgroundColor: mainColors?.box3,
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
        background: `linear-gradient(to right, ${mainColors?.box1} 50%, ${mainColors?.box2} 50%)`,
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
        backgroundColor: mainColors?.triangle,
        position: "absolute",
        inset: 0,
        x: "98vw",
        zIndex: 20,
      },
      animate: {},
      transition: {
        duration: 0.8,
      },
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
        background: `linear-gradient(to right, ${mainColors?.box3} 50%, ${mainColors?.box4} 50%)`,
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

  const fallbackAnimation: PathnameConfig = {
    box1: { initial: {}, animate: {}, transition: {} },
    box2: { initial: {}, animate: {}, transition: {} },
    box3: { initial: {}, animate: {}, transition: {} },
    box4: { initial: {}, animate: {}, transition: {} },
  };

  const selectAnimation = (path: string): PathnameConfig => {
    if (path.startsWith("/dashboard")) {
      return animations["/dashboard"];
    }
    return animations[path as Pathnames] || fallbackAnimation;
  };

  const { box1, box2, box3, box4, triangle, extra, father } =
    selectAnimation(pathname);

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
        style={{ backgroundColor: mainColors?.triangle }}
        className={`triangle bg-[var(--color-triangle)] `}
      />
      {extra && (
        <motion.div
          initial={extra?.initial}
          animate={extra?.animate}
          transition={extra?.transition}
        ></motion.div>
      )}
      <div
        style={{ backgroundColor: mainColors?.box1 }}
        className="bg-[var(--color-box1)] "
      />
      <div
        style={{ backgroundColor: mainColors?.box2 }}
        className="bg-[var(--color-box2)] "
      />
      <div
        style={{ backgroundColor: mainColors?.box3 }}
        className="bg-[var(--color-box3)] "
      />
      <div
        style={{ backgroundColor: mainColors?.box4 }}
        className="bg-[var(--color-box4)] "
      />
    </motion.div>
  );
}

export default BackgroundGrid;
