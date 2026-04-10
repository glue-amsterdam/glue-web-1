"use client";
import { useHomeText } from "@/app/context/MainContext";
import { useSanitizedHTML } from "./hooks/useSanitizedHTML";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useNavigation } from "./context/NavigationContext";
import { runHomeAnimations } from "@/lib/animations/home-animations";
import gsap from "gsap";
import HomeBackground from "@/components/home/HomeBackground";
import HomeLogo from "@/components/home/HomeLogo";
import { useSetPageDataset } from "@/hooks/useSetPageDataset";
import HomeWrapper from "@/components/home/HomeWrapper";
import NavBar from "@/components/NavBar";

export default function HomeClientPage() {
  useSetPageDataset("home");

  /* STATES - REFERENCES - HOOKS CALL*/
  const homeText = useHomeText();
  const { previousUrl } = useNavigation();
  const sanitizedLabel = useSanitizedHTML(homeText?.label || "");

  /* main container reference */
  const container = useRef<HTMLDivElement>(null);
  /* REFERENCES */
  const topNavBarRef = useRef<HTMLDivElement>(null);
  const box1 = useRef<HTMLDivElement>(null);
  const box2 = useRef<HTMLDivElement>(null);
  const box3 = useRef<HTMLDivElement>(null);
  const box4 = useRef<HTMLDivElement>(null);
  const triangle = useRef<HTMLDivElement>(null);
  const lettersContainerRef = useRef<HTMLDivElement>(null);
  const g_letterRef = useRef<SVGSVGElement>(null);
  const l_letterRef = useRef<SVGSVGElement>(null);
  const u_letterRef = useRef<SVGSVGElement>(null);
  const e_letterRef = useRef<SVGSVGElement>(null);
  const gl_line = useRef<SVGLineElement>(null);
  const ue_line = useRef<SVGLineElement>(null);
  const lu_line = useRef<SVGLineElement>(null);
  const eg_line = useRef<SVGLineElement>(null);
  const buttonsAreaRef = useRef<HTMLLIElement>(null);
  const animatedLayerRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const { from, to } = document.documentElement.dataset;
      console.log(from, to);
      if (animatedLayerRef.current) {
        // Avoid first-paint flash before GSAP sets initial tween values.
        gsap.set(animatedLayerRef.current, { visibility: "visible" });
      }
      const tl = gsap.timeline();
      tl.addLabel("start", 0);
      if (from === undefined || to === undefined) {
        runHomeAnimations({
          refs: {
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
            tl,
            lu_line,
            ue_line,
            eg_line,
            topNavBarRef,
            buttonsAreaRef,
          },
          previousUrl,
        });
      } else if (topNavBarRef.current) {
        // Keep navbar visible when intro animation is skipped.
        gsap.set(topNavBarRef.current, { autoAlpha: 1, y: 0, visibility: "visible" });
      }
    },
    { scope: container }
  );

  return (
    <main
      ref={container}
      className="relative min-h-dvh h-full overflow-hidden bg-uiwhite z-0 page-content"
    >
      <NavBar ref={topNavBarRef} className="invisible" />
      {/*   <NavbarBurger ref={topNavBarRef} /> */}
      {homeText && (
        <div
          id="home-text-container"
          className="absolute flex justify-center w-full bottom-[5%] home-text-container"
        >
          <h1 className="sr-only">Welcome to GLUE, Connected by Design</h1>
          <p
            dangerouslySetInnerHTML={{ __html: sanitizedLabel }}
            style={{ color: homeText.color ?? "#fff" }}
            className="text-sm sm:text-base md:tracking-wide lg:text-lg lg:tracking-wider max-w-[40%] md:max-w-[80%] text-center"
          />
        </div>
      )}
      <HomeWrapper
        refs={{
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
          lettersContainerRef,
          scope: container,
        }}
      />
      <div ref={animatedLayerRef} className="absolute inset-0 -z-10 invisible">
        <HomeLogo
          lettersContainerRef={lettersContainerRef}
          g_letterRef={g_letterRef}
          l_letterRef={l_letterRef}
          u_letterRef={u_letterRef}
          e_letterRef={e_letterRef}
          gl_line={gl_line}
          lu_line={lu_line}
          ue_line={ue_line}
          eg_line={eg_line}
        />
        <HomeBackground
          box1={box1}
          box2={box2}
          box3={box3}
          box4={box4}
          triangle={triangle}
        />
      </div>
    </main>
  );
}
