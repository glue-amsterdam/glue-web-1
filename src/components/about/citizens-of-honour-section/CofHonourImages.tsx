import { cn } from "@/lib/utils";
import { ClientCitizen } from "@/schemas/citizenSchema";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import React from "react";

export default function CofHonourImages({
  ref,
  citizens,
  years,
  selectedYear,
  setSelectedYear,
  onOpen,
  textColor,
}: {
  citizens: ClientCitizen[];
  years: string[];
  ref: React.RefObject<HTMLDivElement>;
  selectedYear: string;
  onOpen: (citizen: ClientCitizen) => void;
  setSelectedYear: (year: string) => void;
  textColor: string;
}) {
  const filteredCitizens = citizens;
  // Animation for year changes - only entrance animation
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#citizens",
      },
    });
    if (ref.current) {
      tl.fromTo(
        ref.current.children,
        {
          autoAlpha: 0,
          scale: 1.1,
          filter: "blur(10px)",
        },
        {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.3,
          delay: -0.1,
        }
      );
    }
  }, [selectedYear]); // Trigger animation when citizens or year changes

  return (
    <div className="w-full h-full flex flex-col flex-grow min-h-0 px-4 overflow-hidden pt-4">
      {/* Year Selector */}
      <div id="citizens-of-honour-selector">
        <label htmlFor="year-select" className="sr-only">
          Select year
        </label>
        <select
          style={{ backgroundColor: textColor }}
          id="year-select"
          aria-label="Select year"
          className="text-center tracking-widest font-overpass text-white py-1 px-4 hover:scale-[0.95] transition-all duration-300"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map((year) => (
            <option
              style={{ backgroundColor: textColor }}
              className="text-white "
              key={year}
              value={year}
            >
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Images Grid */}
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 w-full flex-1 h-full min-h-0 gap-1 md:gap-6 pt-2 items-stretch auto-rows-fr",
          `md:grid-cols-${filteredCitizens.length}`
        )}
      >
        {filteredCitizens.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No citizens found for this year.
          </div>
        ) : (
          filteredCitizens.map((citizen) => (
            <button
              key={citizen.id}
              className="h-full min-h-[200px] group relative w-full overflow-hidden"
              onClick={() => onOpen(citizen)}
            >
              <Image
                src={citizen.image_url || "/placeholder.svg"}
                alt={`${citizen.name}, citizen of honour from the GLUE design routes, year ${citizen.year}`}
                width={1920}
                height={1080}
                quality={95}
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover absolute inset-0 w-full h-full group-hover:grayscale-0 md:grayscale-[1] group-hover:scale-105 transition-all duration-300"
                tabIndex={0}
                aria-label={citizen.name}
              />
              <p className="pt-1 text-pretty break-words group-hover:scale-110 text-2xl absolute top-0 tracking-widest left-0 px-2 transition-all duration-300 max-w-[90%]">
                {citizen.name}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
