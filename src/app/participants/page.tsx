import ParticipantsList from "@/app/components/participants/participants-list";
import ParticipantsListSkeleton from "@/app/components/participants/participants-list-skeleton";
import ParticipantsPageHeader from "@/app/components/participants/participants-page-header";
import { NAVBAR_HEIGHT } from "@/constants";
import { Suspense } from "react";

export default function ParticipantsPage() {
  return (
    <section style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}>
      <article className="pt-8">
        <ParticipantsPageHeader />
        <Suspense fallback={<ParticipantsListSkeleton />}>
          <ParticipantsList />
        </Suspense>
      </article>
    </section>
  );
}
