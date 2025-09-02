"use client";
import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import type { ParticipantsResponse } from "@/schemas/participantsSchema";
import { useRef, useState } from "react";
import ParticipantsCarousel from "./ParticipantsCarousel";
import ParticipantInfoPanel from "./ParticipantInfoPanel";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { NoDataAvailable } from "@/app/components/no-data-available";

gsap.registerPlugin(ScrollTrigger);

export default function ParticipantSection({
  participantsData,
}: {
  participantsData: ParticipantsResponse;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { headerData, participants } = participantsData;
  const sectionRef = useRef<HTMLElement>(null);
  const sanitizedDescription = useSanitizedHTML(headerData.description);
  const sanitizedTitle = useSanitizedHTML(headerData.title);
  const participantSelectedImage = useRef<HTMLImageElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      try {
        setActiveIndex(
          Math.floor(Math.random() * participantsData.participants.length)
        );

        // Add a small delay to ensure all elements are mounted
        const timeoutId = setTimeout(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top center",
            },
          });

          // Check if participant selected image exists
          if (participantSelectedImage.current) {
            tl.fromTo(
              participantSelectedImage.current,
              {
                scale: 1.1,
                autoAlpha: 0,
                y: 30,
              },
              {
                autoAlpha: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
              }
            );
          }

          // Check if carousel ref exists
          if (carouselRef.current) {
            tl.fromTo(
              carouselRef.current,
              {
                autoAlpha: 0,
                y: 50,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
              },
              "-=0.3"
            );
          }
        }, 150);

        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error("GSAP animation error in ParticipantSection:", error);
      }
    },
    { scope: sectionRef }
  );

  if (!headerData.is_visible) {
    return null;
  }

  if (participants.length <= 0) return <NoDataAvailable />;

  return (
    <section
      ref={sectionRef}
      id="participants"
      style={{ backgroundColor: headerData.background_color }}
      aria-labelledby="participants-heading participants-description "
      className="min-h-dvh w-full relative flex flex-col pt-[6rem] pb-[4rem]"
    >
      {/* HEADER */}
      <>
        <h2
          id="participants-heading"
          style={{ color: headerData.text_color }}
          className="about-title text-3xl md:text-5xl lg:text-6xl xl:text-7xl px-4"
          dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
        />
        <p
          id="about-description"
          style={{ color: headerData.text_color }}
          className="about-description text-xs md:text-sm lg:text-base px-6"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </>

      {/* PARTICIPANT SELECTED IMAGE */}
      <div
        id="participant-selected-image"
        className="flex flex-col md:flex-row justify-center items-center z-30 gap-4 flex-grow relative"
      >
        <ParticipantInfoPanel
          textColor={headerData.text_color}
          participantSelectedImage={participantSelectedImage}
          participant={participants[activeIndex]}
        />
        <div
          ref={participantSelectedImage}
          className="relative w-full max-h-[60vh] max-w-[80vw] md:max-w-[400px] 2xl:max-w-[450px] aspect-square flex-1 z-30"
        >
          <Link
            target="_blank"
            href={`/participants/${participants[activeIndex].slug}`}
          >
            <Image
              src={
                participants[activeIndex].image?.image_url || "/placeholder.jpg"
              }
              alt={`${participants[activeIndex].userName} profile image thumbnail`}
              width={100}
              height={100}
              sizes="100vw"
              className="object-cover absolute inset-0 w-full h-full hover:scale-95 transition-all duration-100"
              priority={false}
            />
          </Link>
        </div>
        <div className="md:flex-1" />
      </div>
      <ParticipantsCarousel
        textColor={headerData.text_color}
        carouselRef={carouselRef}
        participants={participants}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </section>
  );
}
