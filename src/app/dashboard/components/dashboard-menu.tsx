"use client";

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  ADMIN_DASHBOARD_SECTIONS,
  USER_DASHBOARD_SECTIONS,
  VISITOR_ONLY_DASHBOARD_HREFS,
} from "@/constants";
import CrossRotatedMobile from "@/components/icons/cross-rotated-mobile";

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
    <div className="py-[12px] border border-white p-1 text-(--white-color) base-text-size mt-[15px]">
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
    <nav className="flex flex-col text-(--white-color) base-text-size pt-[30px] gap-[15px] pb-[30px]">

      {filteredDashboardSections.map((item, index) => (
        <Link key={index} href={`/dashboard/${targetUserId}/${item.href}`}>
          <button
            className="flex items-center gap-[15px] cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          >
            <item.icon className="size-6" />
            <span>{item.label}</span>
          </button>
        </Link>
      ))}

      {isMod && (
        <div

          className="border-t border-white flex flex-col text-(--white-color) base-text-size pt-[30px] gap-[15px]"
        >
          <h3 className=" font-bold text-center pb-4 tracking-wider text-sm">
            mod section
          </h3>

          {ADMIN_DASHBOARD_SECTIONS.map((item, index) => (

            <Link key={index} href={`/dashboard/${adminBaseUserId}/${item.href}`}>
              <button
                className="flex items-center gap-[15px] cursor-pointer base-text-size"
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="size-6" />
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
        <SheetTrigger className="lg:hidden" asChild>
          <button
            className="m-4"
            aria-label="Toggle menu"
          >
            {">"}
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="lg:hidden w-80 p-0 overflow-y-auto bg-(--primary-color) text-(--white-color) px-[12px] pb-[15px]"
        >
          <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
          <button
            className="absolute right-4 top-4 z-10 invert"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <CrossRotatedMobile />
          </button>
          <div className="pt-[15px]">
            <h1 className="text-3xl text-(--white-color) pt-[15px]">
              {identityName}
            </h1>
            {isMod && (
              <ModifyingProfileSection
                targetParticipantName={targetParticipantName}
                targetParticipantSlug={targetParticipantSlug}
                targetUserId={targetUserId}
              />
            )}
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <aside className="hidden bg-(--primary-color) lg:flex lg:h-full lg:min-h-0 lg:max-h-full lg:w-[300px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r-2 lg:border-(--black-color) scrollbar scrollbar-thumb-white scrollbar-track-white/10 px-[12px]">
        <h1 className="text-3xl text-(--white-color) pt-[15px]">
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
