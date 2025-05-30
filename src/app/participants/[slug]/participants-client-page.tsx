import ParticipantInfo from "@/app/components/participants/participant-info";
import StaticLogo from "@/app/components/static-logo";
import { NAVBAR_HEIGHT } from "@/constants";
import ImageCarousel from "@/app/components/participants/participant-carousel";
import { ParticipantClientResponse } from "@/types/api-visible-user";

interface ParticipantClientPageProps {
  participant: ParticipantClientResponse;
}

export default function ParticipantClientPage({
  participant,
}: ParticipantClientPageProps) {
  return (
    <section
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`grid grid-cols-1 lg:grid-cols-2 h-full bg-[var(--color-box1)]`}
    >
      <article className="h-[40vh] lg:h-full overflow-hidden relative">
        <div className="absolute inset-0 z-10 mix-blend-lighten pointer-events-none">
          <StaticLogo />
        </div>
        <div className="h-full">
          <ImageCarousel
            userName={participant.user_info.user_name}
            images={participant.images || "/placeholder.jpg"}
          />
        </div>
      </article>
      <article className="h-[60vh] lg:h-full overflow-y-auto">
        <ParticipantInfo participant={participant} />
      </article>
    </section>
  );
}
