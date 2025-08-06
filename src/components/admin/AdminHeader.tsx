"use client";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { StepBack } from "lucide-react";
import { Link } from "next-view-transitions";

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
  return (
    <div className="container mx-auto">
      <div
        className={`flex ${
          isAdminMainPage ? "justify-end" : "justify-between"
        } items-start pb-8`}
      >
        {!isAdminMainPage && (
          <Link
            href={"/admin"}
            className="hover:underline flex text-[var(--color-box1)]"
          >
            <StepBack />
            Back
          </Link>
        )}
        <Button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
