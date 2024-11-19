"use client";

import { ImageCarousel } from "@/app/components/participants/participant-carousel";
import ParticipantInfo from "@/app/components/participants/participant-info";
import StaticLogo from "@/app/components/static-logo";
import { useColors } from "@/app/context/MainContext";
import { NAVBAR_HEIGHT } from "@/constants";
import { placeholderImage } from "@/mockConstants";
import { fetchParticipant } from "@/utils/api";
import { use } from "react";

export default function ParticipantPage({
  params,
}: {
  params: { slug: string };
}) {
  const participant = use(fetchParticipant(params.slug));
  const colors = useColors();

  return (
    <main
      style={{
        backgroundColor: colors?.box1,
      }}
      className="relative h-[100dvh] overflow-hidden"
    >
      <section
        style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
        className={`grid grid-cols-1 lg:grid-cols-2 h-full`}
      >
        <article className="h-[40vh] lg:h-full overflow-hidden relative">
          <div className="absolute inset-0 z-10 mix-blend-lighten pointer-events-none">
            <StaticLogo />
          </div>
          <div className="h-full">
            <ImageCarousel images={participant.images || [placeholderImage]} />
          </div>
        </article>
        <article className="h-[60vh] lg:h-full overflow-y-auto">
          <ParticipantInfo participant={participant} />
        </article>
      </section>
    </main>
  );
}
