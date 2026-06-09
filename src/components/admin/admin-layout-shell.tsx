"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import BigButton from "@/components/big-button";
import {
  AdminMobileMenu,
  AdminMobileMenuTrigger,
  AdminSidebarDesktop,
} from "@/components/admin/admin-sidebar";
import { AdminContentHeaderTitle } from "@/components/admin/admin-content-header";

type AdminLayoutShellProps = {
  children: React.ReactNode;
};

export const AdminLayoutShell = ({ children }: AdminLayoutShellProps) => {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoginPage) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-900">{children}</div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-50 text-zinc-900">
      <Suspense fallback={null}>
        <AdminSidebarDesktop />
      </Suspense>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-zinc-50/95 px-4 py-4 backdrop-blur-sm lg:px-8">
          <AdminMobileMenuTrigger onOpen={() => setIsMobileMenuOpen(true)} />
          <Suspense fallback={<div className="title-text h-[38px] lg:h-[58px]" />}>
            <AdminContentHeaderTitle />
          </Suspense>
          <BigButton mode="big" as="link" href="/" label="Website" target="_blank" />
        </header>
        <AdminMobileMenu
          open={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 base-text-size lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
