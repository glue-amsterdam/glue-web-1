import { cn } from "@/lib/utils";
import { SVGProps } from "react";

interface IProps extends SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
  strokeWidth?: number;
  xPadding?: number;
  pathRef?: React.Ref<SVGPathElement>;
}

export const SVGline = ({
  color = "#fff",
  className,
  strokeWidth = 1.5,
  xPadding = 0,
  pathRef,
  ...props
}: IProps) => {
  const width = 150;
  return (
    <svg
      className={cn(className)}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height={strokeWidth}
      fill="none"
      viewBox={`0 0 ${width} ${strokeWidth}`}
      preserveAspectRatio="none"
      {...props}
    >
      <path
        ref={pathRef}
        stroke={color}
        d={`M${xPadding} ${strokeWidth / 2}H${width - xPadding}`}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};
