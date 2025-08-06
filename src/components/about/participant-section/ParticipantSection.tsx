"use client";
import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import type { ParticipantsResponse } from "@/schemas/participantsSchema";
import { useRef, useState } from "react";
import ParticipantsCarousel from "./ParticipantsCarousel";
import ParticipantInfoPanel from "./ParticipantInfoPanel";
import HomeLogo from "@/components/home/HomeLogo";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { setLines } from "@/lib/animations/home/initial-animations";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { NoDataAvailable } from "@/app/components/no-data-available";

gsap.registerPlugin(ScrollTrigger);

export default function ParticipantSection({
  participantsData,
}: {
  participantsData: ParticipantsResponse;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [activeIndex, setActiveIndex] = useState(0);
  const { headerData, participants } = participantsData;
  const sectionRef = useRef<HTMLElement>(null);
  const sanitizedDescription = useSanitizedHTML(headerData.description);
  const sanitizedTitle = useSanitizedHTML(headerData.title);
  const lettersContainerRef = useRef<HTMLDivElement>(null);
  const g_letterRef = useRef<SVGSVGElement>(null);
  const l_letterRef = useRef<SVGSVGElement>(null);
  const u_letterRef = useRef<SVGSVGElement>(null);
  const e_letterRef = useRef<SVGSVGElement>(null);
  const gl_line = useRef<SVGPathElement>(null);
  const lu_line = useRef<SVGPathElement>(null);
  const ue_line = useRef<SVGPathElement>(null);
  const eg_line = useRef<SVGPathElement>(null);
  const participantSelectedImage = useRef<HTMLImageElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      setActiveIndex(
        Math.floor(Math.random() * participantsData.participants.length)
      );
      setLines({
        lu_line,
        eg_line,
        gl_line,
        ue_line,
      });

      if (isMobile) {
        gsap.set(
          [
            g_letterRef.current,
            l_letterRef.current,
            u_letterRef.current,
            e_letterRef.current,
          ],
          {
            scale: 0.2,
            backgroundColor: "transparent",
          }
        );
      } else {
        gsap.set(
          [
            g_letterRef.current,
            l_letterRef.current,
            u_letterRef.current,
            e_letterRef.current,
          ],
          {
            scale: 0.4,
            backgroundColor: "transparent",
          }
        );
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
        },
      });

      tl.to(
        lu_line.current,
        { strokeDashoffset: 0, duration: 0.3, delay: 0.2 },
        "<"
      )
        .to(eg_line.current, { strokeDashoffset: 0, duration: 0.3 }, "<")
        .addLabel("glue-logo-and-lines-animation-end")
        .from("#background-blur-image", {
          autoAlpha: 0,
        })
        .fromTo(
          participantSelectedImage.current,
          {
            scale: 1.1,
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.3,
            ease: "expo.inOut",
          },
          "<"
        )
        .fromTo(
          ["#participant-info-panel", carouselRef.current],
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
          }
        );
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
      {/* BG IMAGE */}
      <div className="absolute inset-0">
        <Image
          id="background-blur-image"
          src={participants[activeIndex].image?.image_url || "/placeholder.jpg"}
          alt={`${participants[activeIndex].userName} profile image thumbnail`}
          width={500}
          height={500}
          className="w-full h-full blur-[60px] scale-[0.6] grayscale-[0.8] z-0 opacity-50"
          priority={false}
        />
      </div>
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
        <HomeLogo
          style={{ color: headerData.text_color }}
          className="home-logo z-30 absolute max-w-[70%] md:max-w-[95%] max-h-[90%] m-auto"
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

        <ParticipantInfoPanel
          lu_line={lu_line}
          eg_line={eg_line}
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
