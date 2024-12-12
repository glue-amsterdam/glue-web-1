"use client";

import { ReactNode } from "react";
import DashboardMenu from "@/app/dashboard/components/dashboard-menu";
import { NAVBAR_HEIGHT } from "@/constants";
import { useAuth } from "@/app/context/AuthContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  console.log(user);

  /*   if (!isLoggedInUserParticipant && !isLoggedInUserMod) {
    return (
      <div
        className="flex justify-center h-screen z-10 relative"
        style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}
      >

        insufficient access
       <InsufficientAccess />
      </div>
    );
  }
 */
  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT * 2}rem` }}
      className="flex h-full"
    >
      <DashboardMenu />
      <section className="flex-1 p-10 overflow-auto">{children}</section>
    </div>
  );
}
