"use client";

import { useSetPageDataset } from "@/hooks/useSetPageDataset";
import { useColors } from "../context/MainContext";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import NavBar from "@/components/NavBar";
import EventHeader from "../components/events/event-header";
import SearchAndFilter from "../components/events/search-and-filter-events";
import EventModal from "../components/events/event-modal";
import EventListContainer from "../components/events/event-list-container";
import ReactLenis from "@studio-freight/react-lenis";

gsap.registerPlugin(ScrollTrigger);

export default function EventsClientPage({
  params,
  headerTitle,
}: {
  params: URLSearchParams;
  headerTitle: string;
}) {
  useSetPageDataset("upButton");
  /* STATES - REFERENCES - HOOKS CALL*/
  const { box1, box2 } = useColors();

  /* MAIN CONTAINER REFERENCE */
  const container = useRef<HTMLDivElement>(null);
  const topNavBarRef = useRef<HTMLDivElement>(null);
  const animationBlockRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Safety check to ensure refs exist
      if (
        !container.current ||
        !animationBlockRef.current ||
        !topNavBarRef.current
      ) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
        },
      });
      tl.to(animationBlockRef.current, {
        delay: 0.6,
        x: "-100%",
        duration: 1,
        ease: "power2.inOut",
      });
      tl.to("#main-block-container", {
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut",
      });
      tl.to(topNavBarRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.inOut",
      });
    },
    { scope: container }
  );

  return (
    <ReactLenis root>
      <div
        ref={animationBlockRef}
        id="animation-block"
        style={{ backgroundColor: box1 }}
        className="h-full w-1/2 z-50 absolute"
      />
      <main
        ref={container}
        className="min-h-dvh h-full overflow-x-hidden"
        style={{ backgroundColor: box2 }}
      >
        <NavBar ref={topNavBarRef} />
        <div
          id="main-block-container"
          className="container mx-auto px-4 pt-[6rem] opacity-0"
        >
          <EventHeader headerTitle={headerTitle} />
          <section aria-label="Event search and filters">
            <SearchAndFilter />
          </section>

          <EventListContainer params={params} />

          <EventModal />
        </div>
      </main>
    </ReactLenis>
  );
}
