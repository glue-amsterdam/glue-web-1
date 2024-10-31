import CenteredLoader from "@/app/components/centered-loader";
import LogoMain from "@/app/components/logo-main";
import { ImageCarousel } from "@/app/components/participants/participant-carousel";
import ParticipantInfo from "@/app/components/participants/participant-info";
import { NAVBAR_HEIGHT } from "@/constants";
import { placeholderImage } from "@/mockConstants";
import { fetchParticipant } from "@/utils/api";
import { Suspense } from "react";

export default async function MemberPage({
  params,
}: {
  params: { slug: string };
}) {
  const participant = await fetchParticipant(params.slug);

  return (
    <main className="relative h-dvh">
      <section
        style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
        className={`grid grid-cols-1 md:grid-cols-2 h-full grid-rows-2 md:grid-rows-1`}
      >
        <article className="overflow-hidden">
          <LogoMain mode="member" />
          <Suspense fallback={<CenteredLoader />}>
            <ImageCarousel images={participant.images || [placeholderImage]} />
          </Suspense>
        </article>
        <article className="h-full overflow-y-scroll text-uiblack">
          <Suspense fallback={<CenteredLoader />}>
            <ParticipantInfo participant={participant} />
          </Suspense>
        </article>
      </section>
    </main>
  );
}
