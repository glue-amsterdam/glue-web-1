"use client";

import { usePathname, useRouter } from "next/navigation";
import BigButton from "../big-button";

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminMainPage = pathname === "/admin";

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  if (isAdminMainPage) {
    return null;
  }

  return (
    <div className="mb-4 flex justify-end">
      <BigButton
        mode="big"
        as="button"
        onClick={() => handleLogout()}
        label="Log out"
      />
    </div>
  );
}
