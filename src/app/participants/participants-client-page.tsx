"use client";

import { useParticipantsLazy } from "@/hooks/useParticipantsLazy";
import ParticipantCard from "../../components/participants/participant-card";
import ParticipantsLazyLoader from "../../components/participants/participants-lazy-loader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMemo, useRef } from "react";
import ParticipantsPageHeader from "@/components/participants/participants-page-header";
import { useColors } from "../context/MainContext";

export default function ParticipantsClientPage() {
  const { box2 } = useColors();
  const { participants, loading, hasMore, loadMore, error, retry } =
    useParticipantsLazy(12);

  // Use ref to maintain stable shuffle order
  const shuffleOrderRef = useRef<Map<string, number>>(new Map());
  const lastParticipantsLengthRef = useRef<number>(0);

  // Stable shuffle that doesn't reorder existing participants
  const shuffledParticipants = useMemo(() => {
    // If we have new participants, add them to the shuffle order
    if (participants.length > lastParticipantsLengthRef.current) {
      const newParticipants = participants.slice(
        lastParticipantsLengthRef.current
      );

      // Generate random positions for new participants
      newParticipants.forEach((participant) => {
        if (!shuffleOrderRef.current.has(participant.user_id)) {
          // Find an available position (avoiding conflicts)
          let position;
          do {
            position = Math.floor(Math.random() * participants.length);
          } while (
            Array.from(shuffleOrderRef.current.values()).includes(position)
          );

          shuffleOrderRef.current.set(participant.user_id, position);
        }
      });

      lastParticipantsLengthRef.current = participants.length;
    }

    // Sort participants based on their shuffle order
    return [...participants].sort((a, b) => {
      const orderA = shuffleOrderRef.current.get(a.user_id) ?? 0;
      const orderB = shuffleOrderRef.current.get(b.user_id) ?? 0;
      return orderA - orderB;
    });
  }, [participants]);

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

  useGSAP(() => {
    // Target all participant cards using a CSS selector
    const participantCards = document.querySelectorAll("#participant-card");

    gsap.fromTo(
      participantCards,
      {
        opacity: 0,
        y: 100,
        filter: "grayscale(100%)",
        ease: "power2.inOut",
      },
      {
        opacity: 1,
        y: 0,
        filter: "grayscale(0%)",
        stagger: 0.2,
        ease: "power2.inOut",
      }
    );
  }, [shuffledParticipants]); // Changed dependency to shuffledParticipants

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 auto-rows-[200px]">
          {shuffledParticipants.map((participant, index) => {
            const cardConfig = getCardConfig(index);

            // On mobile, all cards occupy 1 column
            const mobileSize = "col-span-1 row-span-1";
            const desktopSize = cardConfig.size;

            return (
              <div
                key={participant.user_id}
                id={`participant-card`}
                className={`${mobileSize} md:${desktopSize} transition-all duration-300`}
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
