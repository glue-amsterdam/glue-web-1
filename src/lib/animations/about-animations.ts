interface AboutAnimationsProps {
  refs: {
    g_letterRef: React.RefObject<SVGSVGElement>;
    gl_line: React.RefObject<SVGPathElement>;
    l_letterRef: React.RefObject<SVGSVGElement>;
    lu_line: React.RefObject<SVGPathElement>;
    u_letterRef: React.RefObject<SVGSVGElement>;
    ue_line: React.RefObject<SVGPathElement>;
    e_letterRef: React.RefObject<SVGSVGElement>;
    eg_line: React.RefObject<SVGPathElement>;
    topNavBarRef: React.RefObject<HTMLDivElement>;
    sectionRef: React.RefObject<HTMLDivElement>;
    titleRef: React.RefObject<HTMLHeadingElement>;
    descriptionRef: React.RefObject<HTMLParagraphElement>;
    imageSliderRef: React.RefObject<HTMLDivElement>;
  };
  tl: GSAPTimeline;
}

export function aboutAnimations({ refs, tl }: AboutAnimationsProps) {
  const { descriptionRef, imageSliderRef, topNavBarRef, titleRef } = refs;

  tl.addLabel("start");

  tl.from([titleRef.current, descriptionRef.current], {
    delay: 0.4,
    filter: "blur(10px)",
    y: 80,
    autoAlpha: 0,
    stagger: 0.3,
  })
    .fromTo(
      [imageSliderRef.current?.querySelectorAll("button")],
      {
        autoAlpha: 0,
        y: 50,
        stagger: 0.05,
        ease: "power2.inOut",
        duration: 0.4,
      },
      {
        y: 0,
        autoAlpha: 1,
        ease: "power2.inOut",
        duration: 0.4,
      },
      "<"
    )
    .from(
      topNavBarRef.current,
      {
        autoAlpha: 0,
        y: -50,
        ease: "power2.inOut",
        duration: 0.2,
      },
      "<"
    );
}
