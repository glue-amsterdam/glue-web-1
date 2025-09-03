"use client";

import { ParticipantClientResponse } from "@/types/api-visible-user";
import HomeLogo from "@/components/home/HomeLogo";
import { useRef } from "react";
import { useColors } from "@/app/context/MainContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  glueLogoandLinesAnimation,
  setLines,
} from "@/lib/animations/home/initial-animations";
import ParticipantInfo from "@/components/participant-page/ParticipantInfo";
import ParticipantImageCarousel from "@/components/participant-page/ParticipantImageCarousel";

interface Hub {
  id: string;
  name: string;
  hub_host_id: string;
  mapInfoId: string | null;
  hub_address: string | null;
}

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ParticipantClientPageProps {
  participant: ParticipantClientResponse;
  hubs: Hub[];
}

export default function ParticipantClientPage({
  participant,
  hubs,
}: ParticipantClientPageProps) {
  const { box1 } = useColors();
  const lettersContainerRef = useRef<HTMLDivElement>(null);
  const g_letterRef = useRef<SVGSVGElement>(null);
  const l_letterRef = useRef<SVGSVGElement>(null);
  const u_letterRef = useRef<SVGSVGElement>(null);
  const e_letterRef = useRef<SVGSVGElement>(null);
  const gl_lineRef = useRef<SVGPathElement>(null);
  const lu_lineRef = useRef<SVGPathElement>(null);
  const ue_lineRef = useRef<SVGPathElement>(null);
  const eg_lineRef = useRef<SVGPathElement>(null);

  // New refs for animations
  const mainContainerRef = useRef<HTMLElement>(null);
  const leftSectionRef = useRef<HTMLElement>(null);
  const rightSectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Main container entrance animation
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Animate carousel with a slight delay
      if (carouselRef.current) {
        gsap.fromTo(
          carouselRef.current,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            delay: 0.3,
            ease: "back.out(1.7)",
          }
        );
      }

      // Set up lines for GLUE logo animation
      setLines({
        gl_line: gl_lineRef,
        lu_line: lu_lineRef,
        ue_line: ue_lineRef,
        eg_line: eg_lineRef,
      });

      // Use the existing GLUE logo and lines animation
      glueLogoandLinesAnimation({
        tl,
        g_letterRef,
        l_letterRef,
        u_letterRef,
        e_letterRef,
        gl_line: gl_lineRef,
        lu_line: lu_lineRef,
        ue_line: ue_lineRef,
        eg_line: eg_lineRef,
      });

      // Add scroll-triggered animations for sections
      ScrollTrigger.create({
        trigger: leftSectionRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(leftSectionRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          });
        },
      });

      ScrollTrigger.create({
        trigger: rightSectionRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(rightSectionRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          });
        },
      });

      // Add hover animations for interactive elements
      const interactiveElements =
        mainContainerRef.current?.querySelectorAll("a, button");
      if (interactiveElements) {
        interactiveElements.forEach((element) => {
          element.addEventListener("mouseenter", () => {
            gsap.to(element, {
              scale: 1.05,
              duration: 0.2,
              ease: "power2.out",
            });
          });

          element.addEventListener("mouseleave", () => {
            gsap.to(element, {
              scale: 1,
              duration: 0.2,
              ease: "power2.out",
            });
          });
        });
      }
    },
    { scope: mainContainerRef }
  );

  return (
    <main
      ref={mainContainerRef}
      style={{ backgroundColor: box1 }}
      className={`grid grid-cols-1 lg:grid-cols-2 pt-[5rem] h-screen overflow-hidden`}
    >
      <section
        ref={leftSectionRef}
        className="h-[40vh] lg:h-full overflow-hidden relative"
      >
        <HomeLogo
          size="w-[95%] h-[95%]"
          className="absolute inset-0 z-10 pointer-events-none"
          lettersContainerRef={lettersContainerRef}
          g_letterRef={g_letterRef}
          l_letterRef={l_letterRef}
          u_letterRef={u_letterRef}
          e_letterRef={e_letterRef}
          gl_line={gl_lineRef}
          lu_line={lu_lineRef}
          ue_line={ue_lineRef}
          eg_line={eg_lineRef}
        />

        <div ref={carouselRef} className="h-full">
          <ParticipantImageCarousel
            userName={participant.user_info.user_name}
            images={participant.images || "/placeholder.jpg"}
          />
        </div>
      </section>

      <section
        ref={rightSectionRef}
        className="h-[60vh] lg:h-full overflow-y-auto"
      >
        <ParticipantInfo participant={participant} hubs={hubs} />
      </section>
    </main>
  );
}
