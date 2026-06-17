"use client";

import type { ClientCitizen } from "@/schemas/citizenSchema";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { useCyclicIndex } from "@/hooks/useCyclicIndex";
import CreativeCitizensContentDesktop from "./creative-citizens-content-desktop";
import CreativeCitizensContentMobile from "./creative-citizens-content-mobile";

const AUTOPLAY_DELAY_MS = 6000;

type Props = {
  description: string;
  citizens: ClientCitizen[];
  archiveYear?: number;
};

const CreativeCitizensDisplay = ({
  description,
  citizens,
  archiveYear,
}: Props) => {
  const {
    currentIndex,
    hasMultiple,
    handleMouseEnter,
    handleMouseLeave,
    handleSelect,
  } = useCyclicIndex({
    itemCount: citizens.length,
    delayMs: AUTOPLAY_DELAY_MS,
  });

  const currentCitizen = citizens[currentIndex];
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!description && !citizens.length) {
    return null;
  }

  return (
    <article
      className="pt-[40px] lg:pt-[60px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {citizens.length > 1 ? (
        <ul className="sr-only">
          {citizens.map((citizen) => (
            <li key={citizen.id ?? citizen.name}>
              {archiveYear != null
                ? `${citizen.name}, Creative Citizen of Honour ${archiveYear}`
                : citizen.name}
            </li>
          ))}
        </ul>
      ) : null}
      {isDesktop ? (
        <CreativeCitizensContentDesktop
          description={description}
          currentCitizen={currentCitizen}
          hasMultiple={hasMultiple}
          currentIndex={currentIndex}
          handleSelect={handleSelect}
          citizens={citizens}
          archiveYear={archiveYear}
        />
      ) : (
        <CreativeCitizensContentMobile
          description={description}
          currentCitizen={currentCitizen}
          hasMultiple={hasMultiple}
          currentIndex={currentIndex}
          handleSelect={handleSelect}
          citizens={citizens}
          archiveYear={archiveYear}
        />
      )}
    </article>
  );
};

export default CreativeCitizensDisplay;
