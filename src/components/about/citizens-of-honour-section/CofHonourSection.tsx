"use client";
import { NoDataAvailable } from "@/app/components/no-data-available";
import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import { ClientCitizen, ClientCitizensSection } from "@/schemas/citizenSchema";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CofHonourImages from "./CofHonourImages";
import CofHonourModal from "./CofHonourModal";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter, useSearchParams } from "next/navigation";

export default function CofHonourSection({
  citizensData,
}: {
  citizensData: ClientCitizensSection;
}) {
  const sanitizedDescription = useSanitizedHTML(citizensData.description || "");
  const sanitizedTitle = useSanitizedHTML(citizensData.title || "");
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const years = useMemo(
    () =>
      Object.keys(citizensData.citizensByYear).sort(
        (a, b) => Number(b) - Number(a)
      ),
    [citizensData.citizensByYear]
  );

  // Read year and citizen from the URL
  const urlYear = searchParams.get("year");
  const urlCitizen = searchParams.get("citizen-honour");

  // State controlled by the URL
  const [selectedYear, setSelectedYearState] = useState<string>(
    urlYear && years.includes(urlYear) ? urlYear : years[0] ?? ""
  );
  const [selectedCitizen, setSelectedCitizen] = useState<ClientCitizen | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Sync selectedYear with the URL
  useEffect(() => {
    if (urlYear && years.includes(urlYear)) {
      setSelectedYearState(urlYear);
    } else if (!urlYear && years.length > 0) {
      setSelectedYearState(years[0]);
    }
  }, [urlYear, years]);

  // Sync selectedCitizen with the URL
  useEffect(() => {
    if (urlCitizen) {
      // Find the citizen by ID in all years
      const allCitizens: ClientCitizen[] = Object.values(
        citizensData.citizensByYear
      ).flat();
      const citizen = allCitizens.find((c) => c.id === urlCitizen);
      if (citizen) {
        setSelectedCitizen(citizen);
        setModalOpen(true);
      } else {
        setModalOpen(false);
        setSelectedCitizen(null);
      }
    } else {
      setModalOpen(false);
      setSelectedCitizen(null);
    }
  }, [urlCitizen, citizensData.citizensByYear]);

  // When the year changes, update the URL
  const handleSetYear = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    // Keep citizen if modal is open
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
    setSelectedYearState(year);
  };

  // When the modal opens, update the URL
  const handleOpenModal = useCallback(
    (citizen: ClientCitizen) => {
      setSelectedCitizen(citizen);
      setModalOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("citizen-honour", citizen.id);
      // Don't set year here - year is managed separately by the year selector
      router.push(`${window.location.pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // When the modal closes, remove citizen from the URL
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedCitizen(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("citizen-honour");
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [router, searchParams]);

  // Scroll to the section if year or citizen is present in the URL on load
  useEffect(() => {
    if ((urlYear || urlCitizen) && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [urlYear, urlCitizen]);

  const citizens = useMemo(
    () => citizensData.citizensByYear[selectedYear] || [],
    [selectedYear, citizensData.citizensByYear]
  );

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
        },
      });
      tl.from(["#citizens-of-honour-header", "#citizens-of-honour-selector"], {
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.3,
        ease: "power2.inOut",
        y: 100,
      });
    },
    {
      scope: sectionRef,
    }
  );

  if (!citizensData.is_visible) {
    return null;
  }

  if (Object.keys(citizensData.citizensByYear).length <= 0) {
    return <NoDataAvailable />;
  }

  return (
    <section
      ref={sectionRef}
      style={{ backgroundColor: citizensData.background_color }}
      id="citizens"
      aria-labelledby="citizens-title"
      className="h-full min-h-dvh w-full flex flex-col pt-[6rem] pb-[4rem]"
    >
      <div
        aria-hidden="true"
        className="radial-gradient-background absolute inset-0 opacity-10 p0ointer-events-none z-10 overflow-hidden"
      />
      <div id="citizens-of-honour-header">
        <h2
          id="citizens-title"
          aria-label="Citizens of Honour"
          style={{ color: citizensData.text_color }}
          className="about-title text-3xl md:text-5xl lg:text-6xl xl:text-7xl px-4"
          dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
        />
        <p
          id="citizens-description"
          aria-label="Citizens of Honour Description"
          style={{ color: citizensData.text_color }}
          className="about-description text-xs md:text-sm lg:text-base px-6"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </div>
      <div className="flex flex-col flex-grow h-full min-h-0">
        <CofHonourImages
          textColor={citizensData.text_color}
          ref={imageRef}
          citizens={citizens}
          years={years}
          selectedYear={selectedYear}
          setSelectedYear={handleSetYear}
          onOpen={handleOpenModal}
        />
      </div>
      <CofHonourModal
        citizen={selectedCitizen}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}
