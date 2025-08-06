import gsap from "gsap";

export function initialAnimations(refs: {
  tl: GSAPTimeline;
  g_letterRef: React.RefObject<SVGSVGElement>;
  l_letterRef: React.RefObject<SVGSVGElement>;
  u_letterRef: React.RefObject<SVGSVGElement>;
  e_letterRef: React.RefObject<SVGSVGElement>;
  gl_line: React.RefObject<SVGPathElement>;
  lu_line: React.RefObject<SVGPathElement>;
  ue_line: React.RefObject<SVGPathElement>;
  eg_line: React.RefObject<SVGPathElement>;
  box1: React.RefObject<HTMLDivElement>;
  box2: React.RefObject<HTMLDivElement>;
  box3: React.RefObject<HTMLDivElement>;
  box4: React.RefObject<HTMLDivElement>;
  triangle: React.RefObject<HTMLDivElement>;
  topNavBarRef: React.RefObject<HTMLDivElement>;
  buttonsAreaRef: React.RefObject<HTMLLIElement>;
}) {
  const {
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
  } = refs;

  const allLetters = [
    g_letterRef.current,
    l_letterRef.current,
    u_letterRef.current,
    e_letterRef.current,
  ];

  /* SET LINES FOR ANIMATION */
  setLines({ gl_line, ue_line, lu_line, eg_line });

  // BACKGROUND ANIMATION
  backgroundAnimation({ tl, box1, box2, box3, box4, triangle });

  // G L U E ANIMATION + LINES ANIMATION
  glueLogoandLinesAnimation({
    tl,
    g_letterRef,
    l_letterRef,
    u_letterRef,
    e_letterRef,
    gl_line,
    lu_line,
    ue_line,
    eg_line,
  });

  // BUTTONS LABELS/AREA ANIMATION
  buttonsLabelsAnimation({ tl });

  // LAST ANIMATION - HOME TEXT/TOP NAVBAR
  lastAnimation({
    tl,
    topNavBarRef,
    allLetters: allLetters as SVGSVGElement[],
  });
}

export function setLines(refs: {
  gl_line?: React.RefObject<SVGPathElement>;
  ue_line?: React.RefObject<SVGPathElement>;
  lu_line?: React.RefObject<SVGPathElement>;
  eg_line?: React.RefObject<SVGPathElement>;
}) {
  const { gl_line, ue_line, lu_line, eg_line } = refs;

  // Para cada línea, si existe, calcula su longitud y aplica gsap.set
  if (gl_line?.current) {
    const length = gl_line.current.getTotalLength();
    gsap.set(gl_line.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
  }
  if (ue_line?.current) {
    const length = ue_line.current.getTotalLength();
    gsap.set(ue_line.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
  }
  if (lu_line?.current) {
    const length = lu_line.current.getTotalLength();
    gsap.set(lu_line.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
  }
  if (eg_line?.current) {
    const length = eg_line.current.getTotalLength();
    gsap.set(eg_line.current, {
      strokeDasharray: length,
      strokeDashoffset: -length,
    });
  }
}
function backgroundAnimation(refs: {
  tl: GSAPTimeline;
  box1: React.RefObject<HTMLDivElement>;
  box2: React.RefObject<HTMLDivElement>;
  box3: React.RefObject<HTMLDivElement>;
  box4: React.RefObject<HTMLDivElement>;
  triangle: React.RefObject<HTMLDivElement>;
}) {
  const { tl, box1, box2, box3, box4, triangle } = refs;
  if (
    box1.current &&
    box2.current &&
    box3.current &&
    box4.current &&
    triangle.current
  ) {
    tl.from(
      box1.current,
      {
        translateY: -100,
        translateX: -100,
        duration: 0.3,
        delay: 0.1,
        ease: "power2.inOut",
      },
      "start"
    )
      .from(
        box4.current,
        {
          translateY: 100,
          translateX: 100,
          duration: 0.3,
          ease: "power2.inOut",
        },
        "<"
      )
      .from(
        box2.current,
        {
          translateY: -100,
          translateX: 100,
          duration: 0.3,
          ease: "power2.inOut",
        },
        ""
      )
      .from(
        box3.current,
        {
          translateY: 100,
          translateX: -100,
          duration: 0.3,
          ease: "power2.inOut",
        },
        "<"
      )
      .from(triangle.current, {
        xPercent: 50,
        duration: 0.5,
        scale: 1.5,
        ease: "power2.inOut",
      });
  }
}
export function glueLogoandLinesAnimation(refs: {
  tl: GSAPTimeline;
  g_letterRef: React.RefObject<SVGSVGElement>;
  l_letterRef: React.RefObject<SVGSVGElement>;
  u_letterRef: React.RefObject<SVGSVGElement>;
  e_letterRef: React.RefObject<SVGSVGElement>;
  gl_line: React.RefObject<SVGPathElement>;
  lu_line: React.RefObject<SVGPathElement>;
  ue_line: React.RefObject<SVGPathElement>;
  eg_line: React.RefObject<SVGPathElement>;
}) {
  const {
    tl,
    g_letterRef,
    l_letterRef,
    u_letterRef,
    e_letterRef,
    gl_line,
    lu_line,
    ue_line,
    eg_line,
  } = refs;
  if (
    g_letterRef.current &&
    l_letterRef.current &&
    u_letterRef.current &&
    e_letterRef.current &&
    gl_line.current &&
    lu_line.current &&
    ue_line.current &&
    eg_line.current
  ) {
    tl.from(g_letterRef.current, { autoAlpha: 0, duration: 0.2 }, "start+=0.5")
      .to(gl_line.current, { strokeDashoffset: 0, duration: 0.2 }, "<0.02")
      .from(l_letterRef.current, { autoAlpha: 0, duration: 0.2 }, ">0.01")
      .to(lu_line.current, { strokeDashoffset: 0, duration: 0.2 }, "<0.02")
      .from(u_letterRef.current, { autoAlpha: 0, duration: 0.2 }, ">0.01")
      .to(ue_line.current, { strokeDashoffset: 0, duration: 0.2 }, "<0.02")
      .from(e_letterRef.current, { autoAlpha: 0, duration: 0.2 }, ">0.01")
      .to(eg_line.current, { strokeDashoffset: 0, duration: 0.2 }, "<0.02")
      .addLabel("glue-logo-and-lines-animation-end");
  }
}
function buttonsLabelsAnimation(refs: { tl: GSAPTimeline }) {
  const { tl } = refs;
  tl.from(
    document.querySelectorAll(".button-area") || [],
    {
      autoAlpha: 0,
      y: 50,
      duration: 0.3,
      filter: "blur(10px)",
      ease: "power2.inOut",
      stagger: 0.1,
    },
    "start+=0.3"
  );
}
function lastAnimation(refs: {
  tl: GSAPTimeline;
  topNavBarRef: React.RefObject<HTMLDivElement>;
  allLetters: SVGSVGElement[];
}) {
  const { tl, topNavBarRef, allLetters } = refs;
  if (topNavBarRef.current)
    tl.from(
      ".home-text-container",
      {
        autoAlpha: 0,
        y: 100,
        duration: 0.5,
        ease: "power2.inOut",
      },
      "glue-logo-and-lines-animation-end+=0.2"
    )
      .from(
        topNavBarRef.current,
        {
          autoAlpha: 0,
          y: -30,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "glue-logo-and-lines-animation-end"
      )
      .to(allLetters, { scale: 0.9 }, "glue-logo-and-lines-animation-end+=0.2");
}
