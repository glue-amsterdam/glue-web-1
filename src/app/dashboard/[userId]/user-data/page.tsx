import UserDataFetch from "@/app/dashboard/[userId]/user-data/user-data-fetch";
import { Suspense } from "react";

export default function MemberDataPage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <Suspense>
      <UserDataFetch userId={params.userId} />
    </Suspense>
  );
}
