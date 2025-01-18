import ParticipantsList from "@/app/components/participants/participants-list";
import ParticipantsListSkeleton from "@/app/components/participants/participants-list-skeleton";
import ParticipantsPageHeader from "@/app/components/participants/participants-page-header";
import { NAVBAR_HEIGHT } from "@/constants";
import { Suspense } from "react";

export default function ParticipantsPage() {
  return (
    <section
      className="flex flex-col h-screen overflow-y-auto"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
    >
      <article className="pt-8 flex-grow">
        <ParticipantsPageHeader />
        <Suspense fallback={<ParticipantsListSkeleton />}>
          <ParticipantsList />
        </Suspense>
      </article>
    </section>
  );
}
