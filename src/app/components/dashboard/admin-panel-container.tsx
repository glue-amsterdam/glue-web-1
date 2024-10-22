import { Suspense } from "react";
import AdminPanel from "@/app/components/dashboard/admin-panel";
import { MembersResponse } from "@/utils/member-types";
import CenteredLoader from "@/app/components/centered-loader";
import { fetchAllMembers } from "@/utils/api";

export default function AdminPanelContainer() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <AdminPanelCall />
    </Suspense>
  );
}

async function AdminPanelCall() {
  const membersResponse: MembersResponse = await fetchAllMembers();
  return <AdminPanel members={membersResponse.members} />;
}
