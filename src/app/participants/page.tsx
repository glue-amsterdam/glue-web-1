/* import ParticipantsList from "@/app/components/participants/participants-list";
import ParticipantsListSkeleton from "@/app/components/participants/participants-list-skeleton";
import ParticipantsPageHeader from "@/app/components/participants/participants-page-header";
import { Suspense } from "react"; */

export const metadata = {
  title: "GLUE Design Routes Participants",
  description: "Explore the talented participants of GLUE design routes.",
};

export default function ParticipantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <ParticipantsPageHeader />
      <Suspense fallback={<ParticipantsListSkeleton />}>
        <ParticipantsList />
      </Suspense> */}
    </div>
  );
}
