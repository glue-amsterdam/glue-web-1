import type { ReactNode } from "react";
import {
  ROUTE_PRINT_FIGMA,
  ROUTE_PRINT_SCALE,
} from "@/lib/map/route-print-figma";

type RoutePrintSheetProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Viewport for the Figma-resolution print canvas, scaled to CSS A4.
 * Children should be laid out in Figma px (2470×3494).
 * Uses a unitless scale (not calc mm/px) so Firefox print applies the transform.
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
        position: "relative",
        contain: "size",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: ROUTE_PRINT_FIGMA.width,
          height: ROUTE_PRINT_FIGMA.height,
          transform: `scale(${ROUTE_PRINT_SCALE})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
};
