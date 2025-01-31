import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useScrollIndicator } from "@/app/hooks/useScrollIndicator";

interface ScrollableTextProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  indicatorClassName?: string;
}

export function ScrollableText({
  children,
  className = "",
  containerClassName = "",
  indicatorClassName = "",
}: ScrollableTextProps) {
  const { showScrollIndicator, contentRef, checkScroll } =
    useScrollIndicator<HTMLDivElement>();

  return (
    <div className={`relative ${containerClassName}`}>
      <div
        ref={contentRef}
        className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray scrollbar-track-gray/20 leading-relaxed ${className}`}
        onScroll={checkScroll}
      >
        {children}
      </div>
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute bottom-0 left-0 right-0 flex justify-center items-center h-8 pointer-events-none ${indicatorClassName}`}
          >
            <ChevronDown className="w-6 h-6 text-gray-500 animate-bounce" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
