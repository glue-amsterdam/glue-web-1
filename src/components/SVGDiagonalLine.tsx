import { cn } from "@/lib/utils";
import { type SVGProps } from "react";

interface DiagonalProps extends SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
  direction?: "tl-br" | "tr-bl";
  strokeWidth?: number;
  pathRef?: React.Ref<SVGPathElement>;
}

export const SVGDiagonalLine = ({
  pathRef,
  color = "#fff",
  className,
  direction = "tl-br",
  strokeWidth = 0.2,
  padding = 0,
  ...props
}: DiagonalProps & { padding?: number }) => {
  // Calcula los puntos de inicio y fin según la dirección y el padding
  const size = 100;
  let x1, y1, x2, y2;
  if (direction === "tl-br") {
    // top-left to bottom-right
    const length = Math.sqrt(2 * size * size);
    const offset = (padding / length) * size;
    x1 = offset;
    y1 = offset;
    x2 = size - offset;
    y2 = size - offset;
  } else {
    // top-right to bottom-left
    const length = Math.sqrt(2 * size * size);
    const offset = (padding / length) * size;
    x1 = size - offset;
    y1 = offset;
    x2 = offset;
    y2 = size - offset;
  }
  return (
    <svg
      className={cn(className)}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      {...props}
    >
      <path
        ref={pathRef}
        d={`M${x1} ${y1} L${x2} ${y2}`}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};
