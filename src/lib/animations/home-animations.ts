import { initialAnimations } from "./home/initial-animations";

export function runHomeAnimations({
  refs,
  previousUrl,
}: {
  refs: {
    box1: React.RefObject<HTMLDivElement>;
    box2: React.RefObject<HTMLDivElement>;
    box3: React.RefObject<HTMLDivElement>;
    box4: React.RefObject<HTMLDivElement>;
    triangle: React.RefObject<HTMLDivElement>;
    g_letterRef: React.RefObject<SVGSVGElement>;
    l_letterRef: React.RefObject<SVGSVGElement>;
    u_letterRef: React.RefObject<SVGSVGElement>;
    e_letterRef: React.RefObject<SVGSVGElement>;
    gl_line: React.RefObject<SVGPathElement>;
    lu_line: React.RefObject<SVGPathElement>;
    ue_line: React.RefObject<SVGPathElement>;
    eg_line: React.RefObject<SVGPathElement>;
    topNavBarRef: React.RefObject<HTMLDivElement>;
    buttonsAreaRef: React.RefObject<HTMLLIElement>;
    tl: GSAPTimeline;
  };
  previousUrl: string | null;
}) {
  const {
    box1,
    box2,
    box3,
    box4,
    triangle,
    g_letterRef,
    l_letterRef,
    u_letterRef,
    e_letterRef,
    gl_line,
    lu_line,
    ue_line,
    eg_line,
    topNavBarRef,
    buttonsAreaRef,
    tl,
  } = refs;

  if (previousUrl === "/" || previousUrl === null) {
    initialAnimations({
      topNavBarRef,
      tl,
      box1,
      box2,
      box3,
      box4,
      triangle,
      g_letterRef,
      l_letterRef,
      u_letterRef,
      e_letterRef,
      gl_line,
      lu_line,
      ue_line,
      eg_line,
      buttonsAreaRef,
    });
  }
}
