"use client";

import type { AdminUsersPageResponse } from "@/lib/admin/get-admin-users-page";
import UsersAdminPanel from "@/app/dashboard/[userId]/users-admin/admin-panel-content";

type Props = {
  initialData: AdminUsersPageResponse;
};

export default function UsersAdminClient({ initialData }: Props) {
  return <UsersAdminPanel initialData={initialData} />;
}
