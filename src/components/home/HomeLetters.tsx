import Eletter from "@/app/components/logo-components/e-letter";
import Gletter from "@/app/components/logo-components/g-letter";
import Lletter from "@/app/components/logo-components/l-letter";
import Uletter from "@/app/components/logo-components/u-letter";
import React from "react";

export default function HomeLetters({
  g_letterRef,
  l_letterRef,
  u_letterRef,
  e_letterRef,
}: {
  g_letterRef: React.RefObject<SVGSVGElement>;
  l_letterRef: React.RefObject<SVGSVGElement>;
  u_letterRef: React.RefObject<SVGSVGElement>;
  e_letterRef: React.RefObject<SVGSVGElement>;
}) {
  return (
    <div className="h-full w-full z-10">
      <Gletter ref={g_letterRef} className="homeLogoLetter top-0 left-0" />
      <Lletter ref={l_letterRef} className="homeLogoLetter top-0 right-0" />
      <Uletter ref={u_letterRef} className="homeLogoLetter bottom-0 left-0" />
      <Eletter ref={e_letterRef} className="homeLogoLetter bottom-0 right-0" />
    </div>
  );
}
