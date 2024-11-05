import { Suspense } from "react";
import CenteredLoader from "@/app/components/centered-loader";
import { fetchAllUsers } from "@/utils/api";
import UsersAdminPage from "@/app/dashboard/[userId]/users-admin/admin-panel-content";

export default function AdminPanelContainer() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <AdminPanelCall />
    </Suspense>
  );
}

async function AdminPanelCall() {
  const users = await fetchAllUsers();

  return <UsersAdminPage users={users} />;
}
