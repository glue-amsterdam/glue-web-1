import ParticipantInfo from "@/app/components/participants/participant-info";
import StaticLogo from "@/app/components/static-logo";
import ImageCarousel from "@/app/components/participants/participant-carousel";
import { ParticipantClientResponse } from "@/types/api-visible-user";

interface ParticipantClientPageProps {
  participant: ParticipantClientResponse;
}

export default function ParticipantClientPage({
  participant,
}: ParticipantClientPageProps) {
  console.log(participant);
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 flex-grow">
      <article className="h-[40dvh] lg:h-full overflow-hidden relative">
        <div className="absolute inset-0 z-10 mix-blend-lighten pointer-events-none">
          <StaticLogo />
        </div>
        <div className="h-full">
          <ImageCarousel
            userName={participant.user_info.user_name}
            images={participant.images || "/participant-placeholder.jpg"}
          />
        </div>
      </article>
      <article className="h-full p-4 overflow-y-auto">
        <ParticipantInfo participant={participant} />
      </article>
    </section>
  );
}
