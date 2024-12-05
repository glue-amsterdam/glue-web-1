import { UserDataFetch } from "@/app/dashboard/[userId]/user-data/user-data-fetch";
import { Suspense } from "react";

export default async function MemberDataPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const params = await props.params;

  console.log(params);
  return (
    <Suspense>
      <UserDataFetch user_id={params.userId} />
    </Suspense>
  );
}
