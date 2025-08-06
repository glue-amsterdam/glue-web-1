import { useMediaQuery } from "@/hooks/userMediaQuery";
import { SVGDiagonalLine } from "../SVGDiagonalLine";
import { SVGline } from "../SVGline";

import React from "react";

export default function LogoLines({
  gl_line,
  lu_line,
  ue_line,
  eg_line,
  color = "#fff",
}: {
  gl_line: React.RefObject<SVGPathElement>;
  lu_line: React.RefObject<SVGPathElement>;
  ue_line: React.RefObject<SVGPathElement>;
  eg_line: React.RefObject<SVGPathElement>;
  color?: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <div className="absolute inset-0 flex justify-center items-center z-0">
      <div className="lines-group relative w-[95%] h-[80%]">
        <SVGline
          pathRef={gl_line}
          color={color}
          className="w-full absolute top-0 left-0 gl-line"
          strokeWidth={2}
          xPadding={12}
        />
        <SVGDiagonalLine
          pathRef={lu_line}
          color={color}
          className="absolute inset-0 lu-line"
          direction="tr-bl"
          strokeWidth={0.3}
          padding={!isMobile ? 13 : 8}
        />
        <SVGline
          pathRef={ue_line}
          color={color}
          className="w-full absolute bottom-0 left-0 ue-line"
          strokeWidth={2}
          xPadding={12}
        />

        <SVGDiagonalLine
          pathRef={eg_line}
          color={color}
          className="absolute inset-0 eg-line"
          direction="tl-br"
          strokeWidth={0.3}
          padding={!isMobile ? 14 : 8}
        />
      </div>
    </div>
  );
}
