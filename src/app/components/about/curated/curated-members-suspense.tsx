import { Suspense } from "react";
import Loader from "@/app/components/centered-loader";
import { fetchCuratedMembers } from "@/utils/api";
import CuratedMembers from "./curated-members";

async function CuratedMembersContent() {
  const { years, curatedMembers } = await fetchCuratedMembers();
  return <CuratedMembers years={years} curatedMembers={curatedMembers} />;
}

export default async function CuratedMembersSuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <CuratedMembersContent />
    </Suspense>
  );
}
