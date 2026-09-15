import type { ReactNode } from "react";
import { ROUTE_PRINT_FIGMA } from "@/lib/map/route-print-figma";

type RoutePrintSheetProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Viewport for the Figma-resolution print canvas, scaled to CSS A4.
 * Children should be laid out in Figma px (2470×3494).
 */
export const RoutePrintSheet = ({
  children,
  className,
}: RoutePrintSheetProps) => {
  return (
    <div
      className={className}
      style={{
        width: "210mm",
        height: "297mm",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: ROUTE_PRINT_FIGMA.width,
          height: ROUTE_PRINT_FIGMA.height,
          transform: `scale(calc(210mm / ${ROUTE_PRINT_FIGMA.width}px))`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
};
