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
}: {
  params: URLSearchParams;
}) {
  useSetPageDataset("upButton");
  /* STATES - REFERENCES - HOOKS CALL*/
  const { triangle } = useColors();

  /* MAIN CONTAINER REFERENCE */
  const container = useRef<HTMLDivElement>(null);
  const topNavBarRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
        },
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
      <main
        ref={container}
        className="min-h-dvh h-full overflow-x-hidden"
        style={{ backgroundColor: triangle }}
      >
        <NavBar ref={topNavBarRef} />
        <div className="container mx-auto px-4 pt-[6rem]">
          <EventHeader />
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
