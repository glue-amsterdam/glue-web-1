"use client";


import { useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { useSearchParams } from "next/navigation";
import EventHeader from "../components/events/event-header";
import SearchAndFilter from "../components/events/search-and-filter-events";
import EventModal from "../components/events/event-modal";
import EventListContainer from "../components/events/event-list-container";

gsap.registerPlugin(ScrollTrigger);

export default function EventsClientPage({
  headerTitle,
}: {
  headerTitle: string;
}) {

  /* MAIN CONTAINER REFERENCE */
  const container = useRef<HTMLDivElement>(null);
  const topNavBarRef = useRef<HTMLDivElement>(null);
  const animationBlockRef = useRef<HTMLDivElement>(null);

  // Use useSearchParams to get current search params (updates on navigation)
  // This ensures we always have a proper URLSearchParams object
  const searchParams = useSearchParams();

  // Filter out eventId from params to prevent list reload when modal opens/closes
  // eventId is only needed for the modal, not for filtering events
  // Extract filter values to compare by value, not reference
  const searchValue = searchParams.get("search") || "";
  const typeValue = searchParams.get("type") || "";
  const dayValue = searchParams.get("day") || "";

  const filterParams = useMemo(() => {
    const filtered = new URLSearchParams();
    if (searchValue) filtered.set("search", searchValue);
    if (typeValue) filtered.set("type", typeValue);
    if (dayValue) filtered.set("day", dayValue);
    return filtered;
  }, [searchValue, typeValue, dayValue]);

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
    { scope: container },
  );

  return (
    <>
      <div
        ref={animationBlockRef}
        id="animation-block"
        style={{ backgroundColor: "var(--color-box1)" }}
        className="h-full w-1/2 z-50 absolute"
      />
      <main
        ref={container}
        className="min-h-dvh h-full overflow-x-hidden"
        style={{ backgroundColor: "var(--color-box2)" }}
      >

        <div
          id="main-block-container"
          className="container mx-auto px-4 pt-[6rem] opacity-0"
        >
          <EventHeader headerTitle={headerTitle} />
          <section aria-label="Event search and filters">
            <SearchAndFilter />
          </section>

          <EventListContainer params={filterParams} />

          <EventModal />
        </div>
      </main>
    </>
  );
}
