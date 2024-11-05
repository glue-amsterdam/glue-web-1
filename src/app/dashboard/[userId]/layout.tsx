import InsufficientAccess from "@/app/dashboard/insufficient-access";
import DashboardMenu from "@/app/dashboard/menu";
import WrongCredentials from "@/app/dashboard/wrong-credentials-acces";
import { NAVBAR_HEIGHT } from "@/constants";
import { fetchUser } from "@/utils/api";
import { ReactNode } from "react";

export default async function UserDashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { userId: string };
}) {
  const { userId } = params;

  const user = await fetchUser(userId);

  const confirmedUser = user.userId === userId;

  if (!user) return <div>Error loading user, no user found for dashboard</div>;

  if (!user.isMod || !confirmedUser) {
    return (
      <div
        className="flex justify-center h-screen z-10 relative"
        style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}
      >
        <WrongCredentials userId={user.userId} userName={user.userName} />
      </div>
    );
  }

  if (user.type !== "participant")
    return (
      <div
        className="flex justify-center h-screen z-10 relative"
        style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}
      >
        <InsufficientAccess userName={user.userName} userId={user.userId} />
      </div>
    );

  return (
    <div
      className="flex h-screen z-10 relative"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
    >
      <DashboardMenu
        userId={user.userId}
        userName={user.userName}
        isMod={user.isMod}
      />
      <section className="flex-1 p-10 overflow-auto">{children}</section>
    </div>
  );
}
