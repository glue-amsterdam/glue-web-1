import React from "react";
import HomeLetters from "./HomeLetters";
import LogoLines from "./LogoLines";
import { cn } from "@/lib/utils";

export default function HomeLogo({
  lettersContainerRef,
  g_letterRef,
  l_letterRef,
  u_letterRef,
  e_letterRef,
  gl_line,
  lu_line,
  ue_line,
  eg_line,
  className,
  style,
  size = "w-[95%] h-[90%]",
}: {
  lettersContainerRef: React.RefObject<HTMLDivElement>;
  g_letterRef: React.RefObject<SVGSVGElement>;
  l_letterRef: React.RefObject<SVGSVGElement>;
  u_letterRef: React.RefObject<SVGSVGElement>;
  e_letterRef: React.RefObject<SVGSVGElement>;
  gl_line: React.RefObject<SVGPathElement>;
  lu_line: React.RefObject<SVGPathElement>;
  ue_line: React.RefObject<SVGPathElement>;
  eg_line: React.RefObject<SVGPathElement>;
  className?: string;
  size?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-20 flex justify-center items-center mix-blend-lighten",
        className
      )}
      style={style}
    >
      <div className={cn("absolute flex z-20", size)} ref={lettersContainerRef}>
        <HomeLetters
          g_letterRef={g_letterRef}
          l_letterRef={l_letterRef}
          u_letterRef={u_letterRef}
          e_letterRef={e_letterRef}
        />

        <LogoLines
          color={style?.color}
          gl_line={gl_line}
          lu_line={lu_line}
          ue_line={ue_line}
          eg_line={eg_line}
        />
      </div>
    </div>
  );
}
