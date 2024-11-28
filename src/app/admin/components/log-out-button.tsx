"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

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

  return (
    <Button
      type="button"
      className="bg-red-500 hover:bg-red-600 text-white"
      onClick={handleLogout}
    >
      Log out
    </Button>
  );
}
