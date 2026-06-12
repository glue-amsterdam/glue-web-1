"use client";

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import {
  ADMIN_DASHBOARD_SECTIONS,
  USER_DASHBOARD_SECTIONS,
  VISITOR_ONLY_DASHBOARD_HREFS,
} from "@/constants";
import CrossRotatedMobile from "@/components/icons/cross-rotated-mobile";
import { cn } from "@/lib/utils";

const ACTIVE_ONLY_SECTIONS = [
  "map-info",
  "events",
];

type DashboardMenuProps = {
  isMod?: boolean;
  isParticipant?: boolean;
  isPendingLimitedAccess?: boolean;
  userName?: string;
  targetUserId?: string;
  loggedInUserId?: string;
  targetParticipantName?: string | null;
  targetParticipantSlug?: string | null;
  is_active: boolean;
};

const ModifyingProfileSection = ({
  targetParticipantName,
  targetParticipantSlug,
  targetUserId,
}: {
  targetParticipantName?: string | null;
  targetParticipantSlug?: string | null;
  targetUserId?: string;
}) => {
  const hasNameOrSlug = targetParticipantName || targetParticipantSlug;

  if (!hasNameOrSlug && !targetUserId) return null;

  return (
    <div className="mt-[15px] min-w-0 wrap-break-word border border-white p-1 py-[12px] text-(--white-color) base-text-size">
      <p className="font-medium">Modifying profile of:</p>
      {hasNameOrSlug ? (
        <>
          {targetParticipantName && <p>User Name: {targetParticipantName}</p>}
          {targetParticipantSlug && <p>User Slug: /{targetParticipantSlug}</p>}
        </>
      ) : (
        <p>ID: {targetUserId}</p>
      )}
    </div>
  );
};

export default function DashboardMenu({
  isMod,
  isParticipant = false,
  isPendingLimitedAccess = false,
  userName,
  targetUserId,
  loggedInUserId,
  targetParticipantName,
  targetParticipantSlug,
  is_active,
}: DashboardMenuProps) {
  const filteredDashboardSections = useMemo(() => {
    const visitorOnlySections = USER_DASHBOARD_SECTIONS.filter((section) =>
      VISITOR_ONLY_DASHBOARD_HREFS.includes(
        section.href as (typeof VISITOR_ONLY_DASHBOARD_HREFS)[number]
      )
    );

    const baseSections = USER_DASHBOARD_SECTIONS.filter(
      (section) => !ACTIVE_ONLY_SECTIONS.includes(section.href)
    );

    if (isMod) return USER_DASHBOARD_SECTIONS;

    if (!isParticipant || isPendingLimitedAccess) return visitorOnlySections;

    if (!is_active) return baseSections;

    return USER_DASHBOARD_SECTIONS;
  }, [isParticipant, isPendingLimitedAccess, is_active, isMod]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const identityName = userName ?? "User";
  const adminBaseUserId = loggedInUserId ?? targetUserId ?? "";

  const SidebarContent = () => (
    <nav className="flex flex-col gap-[15px] pb-[30px] pt-[30px] text-(--white-color) base-text-size">
      {filteredDashboardSections.map((item, index) => (
        <Link key={index} href={`/dashboard/${targetUserId}/${item.href}`}>
          <button
            className="flex cursor-pointer items-center gap-[15px]"
            onClick={() => setIsSidebarOpen(false)}
          >
            <item.icon className="size-6 shrink-0" />
            <span>{item.label}</span>
          </button>
        </Link>
      ))}

      {isMod && (
        <div className="flex flex-col gap-[15px] border-t border-white pt-[30px] text-(--white-color) base-text-size">
          <h3 className="pb-4 text-center text-sm font-bold tracking-wider">
            mod section
          </h3>

          {ADMIN_DASHBOARD_SECTIONS.map((item, index) => (
            <Link key={index} href={`/dashboard/${adminBaseUserId}/${item.href}`}>
              <button
                className="flex cursor-pointer items-center gap-[15px] base-text-size"
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="size-6 shrink-0" />
                <span>{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );

  return (
    <>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <div className="flex w-full shrink-0 items-center gap-3 border-b-2 border-(--black-color) py-3 lg:hidden">
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-white p-2"
              aria-label="Toggle menu"
            >
              <MenuIcon className="size-5" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <h1 className="truncate base-text-size">{identityName.toUpperCase()}</h1>
        </div>
        <SheetContent
          side="left"
          className={cn(
            "lg:hidden p-0 px-[12px] pb-[15px]",
            "bg-(--primary-color) text-(--white-color)",
            "w-[min(100vw-2rem,280px)] max-w-[calc(100vw-2rem)]",
            "top-(--nav-total-h-mobile) bottom-(--site-footer-h) h-auto",
            "overflow-y-auto overflow-x-hidden"
          )}
        >
          <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
          <button
            type="button"
            className="absolute right-4 top-4 z-10"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <CrossRotatedMobile />
          </button>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-[15px]">
            {isMod && (
              <div className="shrink-0">
                <ModifyingProfileSection
                  targetParticipantName={targetParticipantName}
                  targetParticipantSlug={targetParticipantSlug}
                  targetUserId={targetUserId}
                />
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <SidebarContent />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden bg-(--primary-color) lg:flex lg:h-full lg:min-h-0 lg:max-h-full lg:w-[300px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r-2 lg:border-(--black-color) scrollbar scrollbar-thumb-white scrollbar-track-white/10 px-[12px]">
        <h1 className="pt-[15px] text-3xl text-(--white-color)">
          {identityName}
        </h1>
        {isMod && (
          <ModifyingProfileSection
            targetParticipantName={targetParticipantName}
            targetParticipantSlug={targetParticipantSlug}
            targetUserId={targetUserId}
          />
        )}
        <SidebarContent />
      </aside>
    </>
  );
}
