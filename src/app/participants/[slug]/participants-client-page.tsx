import ParticipantInfo from "@/app/components/participants/participant-info";
import StaticLogo from "@/app/components/static-logo";
import { placeholderImage } from "@/mockConstants";
import { NAVBAR_HEIGHT } from "@/constants";
import { ParticipantUser } from "@/schemas/usersSchemas";
import ImageCarousel from "@/app/components/participants/participant-carousel";
import { MapLocationEnhaced } from "@/schemas/mapSchema";

interface ParticipantClientPageProps {
  participant: ParticipantUser;
  mapData: MapLocationEnhaced | null;
}

export default function ParticipantClientPage({
  participant,
  mapData,
}: ParticipantClientPageProps) {
  return (
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
        <ParticipantInfo participant={participant} mapData={mapData} />
      </article>
    </section>
  );
}
