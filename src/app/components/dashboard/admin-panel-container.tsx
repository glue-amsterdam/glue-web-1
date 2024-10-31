import { Suspense } from "react";
import AdminPanel from "@/app/components/dashboard/admin-panel";
import CenteredLoader from "@/app/components/centered-loader";
import { fetchAllUsers } from "@/utils/api";

export default function AdminPanelContainer() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <AdminPanelCall />
    </Suspense>
  );
}

async function AdminPanelCall() {
  const users = await fetchAllUsers();

  return <AdminPanel users={users} />;
}
