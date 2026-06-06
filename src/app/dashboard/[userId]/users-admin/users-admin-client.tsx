"use client";

import type { AdminUserListItem } from "@/types/admin-user";
import UsersAdminPanel from "@/app/dashboard/[userId]/users-admin/admin-panel-content";

type Props = {
  users: AdminUserListItem[];
};

export default function UsersAdminClient({ users }: Props) {
  return <UsersAdminPanel users={users} />;
}
