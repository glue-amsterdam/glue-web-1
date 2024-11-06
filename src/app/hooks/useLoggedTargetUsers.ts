"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useDashboardUserContext } from "@/app/context/UserDashboardContext";
import { LoggedInUserType } from "@/schemas/usersSchemas";

interface LoggedTargetUsers {
  loggedInUser: LoggedInUserType | null;
  targetUserId: string | undefined;
}

const useLoggedTargetUsers = (): LoggedTargetUsers => {
  const { user: loggedInUser } = useAuth();
  const { userId: targetUserId } = useDashboardUserContext();

  return { loggedInUser, targetUserId };
};

export default useLoggedTargetUsers;
