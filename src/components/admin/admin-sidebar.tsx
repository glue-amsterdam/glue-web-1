"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import BigButton from "@/components/big-button";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import CrossRotatedMobile from "@/components/icons/cross-rotated-mobile";

const AdminSidebarHeader = () => (
  <div className="border-b border-zinc-200 px-4 py-4">
    <h1 className="title-text text-zinc-900">Admin</h1>
  </div>
);

const AdminSidebarFooter = ({ onLogout }: { onLogout: () => void }) => (
  <div className="border-t border-zinc-200 p-4">
    <BigButton mode="big" as="button" onClick={onLogout} label="Log out" />
  </div>
);

const AdminSidebarInner = ({
  onNavigate,
  onLogout,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
}) => (
  <div className="flex h-full min-h-0 flex-col">
    <AdminSidebarHeader />
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
      <Suspense fallback={<div className="base-text-size p-3 text-zinc-500">Loading menu...</div>}>
        <AdminSidebarNav onNavigate={onNavigate} />
      </Suspense>
    </div>
    <AdminSidebarFooter onLogout={onLogout} />
  </div>
);

export const AdminSidebarDesktop = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (response.ok) {
        router.refresh();
        return;
      }
      throw new Error("Logout failed");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
      <AdminSidebarInner onLogout={handleLogout} />
    </aside>
  );
};

export const AdminMobileMenu = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (response.ok) {
        onOpenChange(false);
        router.refresh();
        return;
      }
      throw new Error("Logout failed");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(100vw-2rem,280px)] p-0 lg:hidden"
      >
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <button
          type="button"
          className="absolute right-4 top-4 z-10"
          onClick={() => onOpenChange(false)}
          aria-label="Close menu"
        >
          <CrossRotatedMobile />
        </button>
        <AdminSidebarInner
          onNavigate={() => onOpenChange(false)}
          onLogout={handleLogout}
        />
      </SheetContent>
    </Sheet>
  );
};

export const AdminMobileMenuTrigger = ({
  onOpen,
}: {
  onOpen: () => void;
}) => (
  <button
    type="button"
    className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white p-2 text-zinc-700 lg:hidden"
    onClick={onOpen}
    aria-label="Open admin menu"
  >
    <Menu className="size-5" aria-hidden="true" />
  </button>
);
