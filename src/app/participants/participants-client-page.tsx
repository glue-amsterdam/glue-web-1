"use client";

import { useParticipantsLazy } from "@/hooks/useParticipantsLazy";
import ParticipantCard from "../../components/participants/participant-card";
import ParticipantsLazyLoader from "../../components/participants/participants-lazy-loader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useEffect, useState } from "react";
import ParticipantsPageHeader from "@/components/participants/participants-page-header";
import { useColors } from "../context/MainContext";

export default function ParticipantsClientPage() {
  const { box2 } = useColors();
  const { participants, loading, hasMore, loadMore, error, retry } =
    useParticipantsLazy(12);

  // Keep track of previously animated participants
  const animatedParticipantsRef = useRef<Set<string>>(new Set());
  const [isInitialRender, setIsInitialRender] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to determine card size and style
  const getCardConfig = (index: number) => {
    const configs = [
      { size: "col-span-1 row-span-1", variant: "default" },
      { size: "col-span-1 row-span-2", variant: "tall" },
      { size: "col-span-2 row-span-1", variant: "wide" },
      { size: "col-span-2 row-span-2", variant: "large" },
      { size: "col-span-1 row-span-1", variant: "default" },
      { size: "col-span-1 row-span-2", variant: "tall" },
      { size: "col-span-2 row-span-1", variant: "wide" },
      { size: "col-span-1 row-span-1", variant: "default" },
      { size: "col-span-2 row-span-2", variant: "large" },
      { size: "col-span-1 row-span-1", variant: "default" },
      { size: "col-span-1 row-span-2", variant: "tall" },
      { size: "col-span-2 row-span-1", variant: "wide" },
    ];

    return configs[index % configs.length];
  };

  // Set initial render to false after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 100); // Small delay to ensure DOM is ready
    return () => clearTimeout(timer);
  }, []);

  // Initial animation for first load
  useGSAP(() => {
    if (!isInitialRender || participants.length === 0 || !containerRef.current)
      return;

    const participantElements = participants
      .map((participant) =>
        containerRef.current?.querySelector(
          `[data-participant-id="${participant.user_id}"]`
        )
      )
      .filter(Boolean) as Element[];

    if (participantElements.length === 0) return;

    // Mark all initial participants as animated
    participants.forEach((participant) => {
      animatedParticipantsRef.current.add(participant.user_id);
    });

    // Immediately set initial state to prevent flash
    gsap.set(participantElements, {
      opacity: 0,
      y: 100,
      filter: "grayscale(100%)",
    });

    // Small delay to ensure state is set, then animate
    gsap.delayedCall(0.1, () => {
      gsap.to(participantElements, {
        opacity: 1,
        y: 0,
        filter: "grayscale(0%)",
        stagger: 0.15,
        ease: "power2.out",
        duration: 0.6,
      });
    });
  }, [participants, isInitialRender]);

  // Handle new participants (lazy loading)
  useGSAP(() => {
    if (isInitialRender || participants.length === 0 || !containerRef.current)
      return;

    // Find new participants that haven't been animated yet
    const newParticipants = participants.filter(
      (participant) => !animatedParticipantsRef.current.has(participant.user_id)
    );

    if (newParticipants.length === 0) return;

    // Get the DOM elements for new participants only
    const newParticipantElements = newParticipants
      .map((participant) =>
        containerRef.current?.querySelector(
          `[data-participant-id="${participant.user_id}"]`
        )
      )
      .filter(Boolean) as Element[];

    if (newParticipantElements.length === 0) return;

    // Mark these participants as animated
    newParticipants.forEach((participant) => {
      animatedParticipantsRef.current.add(participant.user_id);
    });

    // Set initial state for new participants
    gsap.set(newParticipantElements, {
      opacity: 0,
      y: 50,
      filter: "grayscale(100%)",
    });

    // Animate new participants
    gsap.to(newParticipantElements, {
      opacity: 1,
      y: 0,
      filter: "grayscale(0%)",
      stagger: 0.1,
      ease: "power2.out",
      duration: 0.5,
    });
  }, [participants, isInitialRender]);

  if (error) {
    return (
      <div className="about-w mx-auto mb-10">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">
            Error loading participants: {error}
          </p>
          <button
            onClick={retry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      style={{ backgroundColor: box2 }}
      className="flex flex-col min-h-screen overflow-y-auto pt-[5rem]"
    >
      <div className="about-w mx-auto mb-10">
        <ParticipantsPageHeader />
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 auto-rows-[200px]"
        >
          {participants.map((participant, index) => {
            const cardConfig = getCardConfig(index);

            // On mobile, all cards occupy 1 column
            const mobileSize = "col-span-1 row-span-1";
            const desktopSize = cardConfig.size;

            return (
              <div
                key={participant.user_id}
                data-participant-id={participant.user_id}
                className={`${mobileSize} md:${desktopSize}`}
                style={{
                  opacity: isInitialRender ? 0 : 1,
                  transform: isInitialRender
                    ? "translateY(100px)"
                    : "translateY(0px)",
                  filter: isInitialRender ? "grayscale(100%)" : "grayscale(0%)",
                }}
              >
                <ParticipantCard
                  participant={participant}
                  size={cardConfig.size}
                  variant={cardConfig.variant}
                />
              </div>
            );
          })}

          {/* Lazy Loader */}
          <ParticipantsLazyLoader
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
}
