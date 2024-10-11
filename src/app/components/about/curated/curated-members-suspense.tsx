import { Suspense } from "react";
import Loader from "@/app/components/loader";
import { fetchCuratedMembers } from "@/utils/api";
import CuratedMembers from "./curated-members";

async function CuratedMembersContent() {
  const { years, curatedMembers } = await fetchCuratedMembers();
  return <CuratedMembers years={years} curatedMembers={curatedMembers} />;
}

export default async function CuratedMembersSuspense() {
  return (
    <section
      className="mb-12 container mx-auto px-4"
      aria-labelledby="curated-members-heading"
    >
      <Suspense fallback={<Loader />}>
        <CuratedMembersContent />
      </Suspense>
    </section>
  );
}
