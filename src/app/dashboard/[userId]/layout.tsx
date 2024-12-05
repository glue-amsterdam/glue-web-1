"use client";
import { useAuth } from "@/app/context/AuthContext";
import { UserDashboardProvider } from "@/app/context/UserDashboardContext";
import InsufficientAccess from "@/app/dashboard/insufficient-access";
import DashboardMenu from "@/app/dashboard/menu";
import WrongCredentials from "@/app/dashboard/wrong-credentials-access";
import { NAVBAR_HEIGHT } from "@/constants";
import { ReactNode, use } from "react";

export default function UserDashboardLayout(props: {
  children: ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const params = use(props.params);

  const { children } = props;

  const { userId: targetUserId } = params;
  const { user: loggedInUser } = useAuth();

  if (!loggedInUser) {
    return <div>Error loading user, no user found for dashboard</div>;
  }

  const isLoggedInUserMod = loggedInUser.is_mod;
  const isTargetUserSameAsLoggedInUser = loggedInUser.user_id === targetUserId;
  const isLoggedInUserParticipant = loggedInUser.userType === "participant";

  if (!isLoggedInUserMod && !isTargetUserSameAsLoggedInUser) {
    return (
      <div
        className="flex justify-center h-screen z-10 relative"
        style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}
      >
        <WrongCredentials
          userId={loggedInUser.user_id}
          userName={loggedInUser.user_name}
        />
      </div>
    );
  }

  if (!isLoggedInUserParticipant) {
    return (
      <div
        className="flex justify-center h-screen z-10 relative"
        style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}
      >
        <InsufficientAccess
          userName={loggedInUser.user_name}
          userId={loggedInUser.user_id}
        />
      </div>
    );
  }

  return (
    <UserDashboardProvider userId={targetUserId}>
      <div
        className="flex h-screen z-10 relative"
        style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      >
        <DashboardMenu loggedInUser={loggedInUser} />
        <section className="flex-1 p-10 overflow-auto">{children}</section>
      </div>
    </UserDashboardProvider>
  );
}
