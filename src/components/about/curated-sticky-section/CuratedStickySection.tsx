"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { CuratedV2Group } from "@/lib/about/fetch-curated-section-v2";
import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import StickySelectorBlock from "./StickySelectorBlock";
import CuratedStickyHeader from "./CuratedStickyHeader";
import HomeLogo from "@/components/home/HomeLogo";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLines } from "@/lib/animations/home/initial-animations";

gsap.registerPlugin(ScrollTrigger);

interface CuratedStickySectionProps {
  headerData: {
    title: string;
    description: string;
    is_visible: boolean;
    text_color: string;
    background_color: string;
  };
  curatedGroups: Record<number, CuratedV2Group>;
}

// Custom hook for managing refs
const useLogoRefs = () => {
  const lettersContainerRef = useRef<HTMLDivElement>(null);
  const g_letterRef = useRef<SVGSVGElement>(null);
  const l_letterRef = useRef<SVGSVGElement>(null);
  const u_letterRef = useRef<SVGSVGElement>(null);
  const e_letterRef = useRef<SVGSVGElement>(null);
  const gl_line = useRef<SVGPathElement>(null);
  const lu_line = useRef<SVGPathElement>(null);
  const ue_line = useRef<SVGPathElement>(null);
  const eg_line = useRef<SVGPathElement>(null);

  return {
    lettersContainerRef,
    g_letterRef,
    l_letterRef,
    u_letterRef,
    e_letterRef,
    gl_line,
    lu_line,
    ue_line,
    eg_line,
  };
};

// Custom hook for animations
const useLogoAnimations = (
  refs: ReturnType<typeof useLogoRefs>,
  photoId: string,
  sectionRef: React.RefObject<HTMLElement>
) => {
  useGSAP(
    () => {
      try {
        setLines({
          gl_line: refs.gl_line,
          ue_line: refs.ue_line,
          lu_line: refs.lu_line,
          eg_line: refs.eg_line,
        });

        // Add null checks for letter refs
        const letterRefs = [
          refs.g_letterRef.current,
          refs.l_letterRef.current,
          refs.u_letterRef.current,
          refs.e_letterRef.current,
        ].filter(Boolean);

        if (letterRefs.length > 0) {
          gsap.set(letterRefs, {
            scale: 0.8,
            transformOrigin: "center center",
          });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
          },
        });

        tl.addLabel("start");

        // Check if photo element exists
        const photoElement = document.querySelector(photoId);
        if (photoElement) {
          tl.fromTo(
            photoId,
            {
              scale: 1.2,
              filter: "blur(10px)",
            },
            { scale: 1, filter: "blur(0px)", duration: 0.2 }
          );
        }

        // Check if all required refs exist before animating
        if (
          refs.g_letterRef.current &&
          refs.l_letterRef.current &&
          refs.u_letterRef.current &&
          refs.e_letterRef.current &&
          refs.gl_line.current &&
          refs.lu_line.current &&
          refs.ue_line.current &&
          refs.eg_line.current
        ) {
          tl.fromTo(
            refs.g_letterRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.2 },
            "start+=0.5"
          )
            .to(
              refs.gl_line.current,
              { strokeDashoffset: 0, duration: 0.2 },
              "<0.02"
            )
            .fromTo(
              refs.l_letterRef.current,
              { opacity: 0 },
              { opacity: 1, duration: 0.2 },
              ">0.01"
            )
            .to(
              refs.lu_line.current,
              { strokeDashoffset: 0, duration: 0.2 },
              "<0.02"
            )
            .fromTo(
              refs.u_letterRef.current,
              { opacity: 0 },
              { opacity: 1, duration: 0.2 },
              ">0.01"
            )
            .to(
              refs.ue_line.current,
              { strokeDashoffset: 0, duration: 0.2 },
              "<0.02"
            )
            .fromTo(
              refs.e_letterRef.current,
              { opacity: 0 },
              { opacity: 1, duration: 0.2 },
              ">0.01"
            )
            .to(
              refs.eg_line.current,
              { strokeDashoffset: 0, duration: 0.2 },
              "<0.02"
            );
        }
      } catch (error) {
        console.error("GSAP animation error in CuratedStickySection:", error);
      }
    },
    { scope: sectionRef }
  );
};

// Reusable image component
const LogoImageContent: React.FC<{
  refs: ReturnType<typeof useLogoRefs>;
  groupPhotoUrl: string;
  selectedYear: number;
  photoId: string;
  sizes?: string;
}> = ({
  refs,
  groupPhotoUrl,
  selectedYear,
  photoId,
  sizes = "(max-width: 768px) 100vw, 80vw",
}) => {
  if (!groupPhotoUrl) return null;

  return (
    <>
      <HomeLogo
        lettersContainerRef={refs.lettersContainerRef}
        g_letterRef={refs.g_letterRef}
        l_letterRef={refs.l_letterRef}
        u_letterRef={refs.u_letterRef}
        e_letterRef={refs.e_letterRef}
        gl_line={refs.gl_line}
        lu_line={refs.lu_line}
        ue_line={refs.ue_line}
        eg_line={refs.eg_line}
        className="absolute inset-0 z-10"
        size="w-[95%] h-[90%]"
      />
      <Image
        id={photoId}
        src={groupPhotoUrl || "/placeholder.svg"}
        alt={`Group photo for year ${selectedYear}`}
        width={1920}
        height={1080}
        quality={95}
        sizes={sizes}
        className="object-cover w-full h-full absolute inset-0 z-0 transition-transform duration-300"
        style={{
          objectPosition: "center",
          width: "100%",
          height: "100%",
        }}
        priority
      />
    </>
  );
};

const CuratedStickySection: React.FC<CuratedStickySectionProps> = ({
  headerData,
  curatedGroups,
}) => {
  // Single set of refs for both desktop and mobile
  const desktopRefs = useLogoRefs();
  const mobileRefs = useLogoRefs();

  const sanitizedTitle = useSanitizedHTML(headerData.title || "");
  const sanitizedDescription = useSanitizedHTML(headerData.description || "");
  const years = Object.keys(curatedGroups)
    .map(Number)
    .sort((a, b) => b - a);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial year from URL or default to first year
  const getInitialYear = (): number => {
    const stickyParam = searchParams.get("sticky");
    if (stickyParam) {
      const yearFromUrl = parseInt(stickyParam, 10);
      if (!isNaN(yearFromUrl) && years.includes(yearFromUrl)) {
        return yearFromUrl;
      }
    }
    return years[0] || 0;
  };

  const [selectedYear, setSelectedYear] = useState<number>(getInitialYear);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const group = curatedGroups[selectedYear];
  const participants = [...(group?.participants || [])];

  // Update URL when year changes
  const updateUrlWithYear = (year: number) => {
    const currentUrl = new URL(window.location.href);
    const currentParams = new URLSearchParams(currentUrl.search);

    // Clear all previous parameters
    currentParams.delete("sticky");

    // Add the new sticky parameter
    currentParams.set("sticky", year.toString());

    // Update URL without page reload
    const newUrl = `${currentUrl.pathname}?${currentParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  const handleToggleDrawer = () => {
    setIsMobileDrawerOpen(!isMobileDrawerOpen);
  };

  const handleCloseDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateUrlWithYear(year);
    setIsMobileDrawerOpen(false);
  };

  // Sync with URL changes
  useEffect(() => {
    const stickyParam = searchParams.get("sticky");
    if (stickyParam) {
      const yearFromUrl = parseInt(stickyParam, 10);
      if (
        !isNaN(yearFromUrl) &&
        years.includes(yearFromUrl) &&
        yearFromUrl !== selectedYear
      ) {
        setSelectedYear(yearFromUrl);
      }
    }
  }, [searchParams, years, selectedYear]);

  // Use animations for both desktop and mobile
  useLogoAnimations(desktopRefs, "#curated-group-photo-desktop", sectionRef);
  useLogoAnimations(mobileRefs, "#curated-group-photo-mobile", sectionRef);

  if (!headerData.is_visible) return null;

  return (
    <section
      ref={sectionRef}
      id="curated"
      style={{ backgroundColor: headerData.background_color }}
      aria-labelledby="curated-title curated-description"
      className="min-h-dvh w-full flex flex-col pt-[6rem] pb-[4rem]"
    >
      <div
        id="curated-background-black-gradient"
        aria-hidden="true"
        className="radial-gradient-background absolute inset-0 opacity-50 pointer-events-none z-[9]"
      />
      <CuratedStickyHeader
        textColor={headerData.text_color}
        sanitizedTitle={sanitizedTitle}
        sanitizedDescription={sanitizedDescription}
      />

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-4 w-full h-[70vh] min-h-[70vh] max-h-[70vh]">
        <div className="col-span-1 h-full hover:scale-image overflow-hidden">
          <StickySelectorBlock
            textColor={headerData.text_color}
            bgColor={headerData.background_color}
            years={years}
            selectedYear={selectedYear}
            setSelectedYear={handleYearChange}
            participants={participants}
          />
        </div>
        <div
          className="col-span-3 relative overflow-hidden h-full"
          style={{ backgroundColor: headerData.background_color }}
        >
          <LogoImageContent
            refs={desktopRefs}
            groupPhotoUrl={group?.group_photo_url || ""}
            selectedYear={selectedYear}
            photoId="curated-group-photo-desktop"
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full flex-1 flex min-h-0 relative">
        {/* Mobile Toggle Button */}
        <button
          onClick={handleToggleDrawer}
          className="absolute items-center top-1/2 -translate-y-1/2 left-4 z-20 p-3 rounded-lg bg-black/20 backdrop-blur-sm border border-white/20 hover:bg-black/30 transition-colors duration-200"
          style={{ color: headerData.text_color }}
          aria-label="Toggle participants list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 12l-10 0" />
            <path d="M20 12l-4 4" />
            <path d="M20 12l-4 -4" />
            <path d="M4 4l0 16" />
          </svg>
          <span className="sr-only">More years</span>
        </button>

        {/* Mobile Drawer Overlay */}
        {isMobileDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={handleCloseDrawer}
            aria-hidden="true"
          />
        )}

        {/* Mobile Drawer */}
        <div
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full w-full relative">
            {/* Close Button */}
            <button
              onClick={handleCloseDrawer}
              className="absolute top-2 left-2 z-50 p-2 rounded-full backdrop-blur-sm duration-200"
              style={{ color: headerData.text_color }}
              aria-label="Close participants list"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Drawer Content */}
            <StickySelectorBlock
              textColor={headerData.text_color}
              bgColor={headerData.background_color}
              years={years}
              selectedYear={selectedYear}
              setSelectedYear={handleYearChange}
              participants={participants}
            />
          </div>
        </div>

        {/* Mobile Image Container */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{
            height: "calc(100vh - 6rem)",
            backgroundColor: headerData.background_color,
          }}
        >
          <LogoImageContent
            refs={mobileRefs}
            groupPhotoUrl={group?.group_photo_url || ""}
            selectedYear={selectedYear}
            photoId="curated-group-photo-mobile"
            sizes="(max-width: 768px) 100vw"
          />
        </div>
      </div>
    </section>
  );
};

export default CuratedStickySection;
