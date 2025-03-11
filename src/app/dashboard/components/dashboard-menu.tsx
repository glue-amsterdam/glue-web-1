"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import {
  ADMIN_DASHBOARD_SECTIONS,
  NAVBAR_HEIGHT,
  USER_DASHBOARD_SECTIONS,
} from "@/constants";

// List of sections that should only be visible when is_active is true
const ACTIVE_ONLY_SECTIONS = [
  "profile-image",
  "visiting-hours",
  "map-info",
  "invoice-data",
  "create-events",
  "your-events",
];

type DashboardMenuProps = {
  isMod?: boolean;
  userName?: string;
  targetUserId?: string;
  is_active: boolean;
};

export default function DashboardMenu({
  isMod,
  userName,
  targetUserId,
  is_active,
}: DashboardMenuProps) {
  const filteredDashboardSections = useMemo(() => {
    let sections = USER_DASHBOARD_SECTIONS;

    if (!is_active) {
      sections = USER_DASHBOARD_SECTIONS.filter((section) => {
        return !ACTIVE_ONLY_SECTIONS.includes(section.href);
      });
    }

    return sections;
  }, [is_active]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  // Filter dashboard sections based on is_active status

  const SidebarContent = () => (
    <nav className="space-y-4 p-6">
      <AnimatePresence>
        {filteredDashboardSections.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/dashboard/${targetUserId}/${item.href}`}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white hover:text-gray-800 hover:bg-[var(--color-box2)] transition-all duration-200"
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="size-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
      {isMod && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-[var(--color-box3)]"
        >
          <h3 className="text-white font-bold text-center pb-4 tracking-wider text-sm uppercase">
            Mod Section
          </h3>
          <AnimatePresence>
            {ADMIN_DASHBOARD_SECTIONS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/dashboard/${user.id}/${item.href}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-white hover:text-gray-800 hover:bg-[var(--color-box2)] transition-all duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </nav>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden w-fit"
      >
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="m-4 bg-[var(--color-box2)] text-white hover:bg-[var(--color-box3)]"
              aria-label="Toggle menu"
            >
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-[var(--color-box1)]">
            <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-white hover:bg-[var(--color-box2)]"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close menu"
            ></Button>
            <div className="p-6">
              <h2 className="text-white text-xl font-bold mb-2">
                Hello, {userName || user.email}
              </h2>
              {isMod && targetUserId && (
                <p className="text-sm text-gray-600 mb-6">
                  Modifying profile of ID: {targetUserId}
                </p>
              )}
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          paddingTop: `${NAVBAR_HEIGHT}rem`,
        }}
        className="hidden md:block w-80 bg-[var(--color-box1)] shadow-xl overflow-y-auto fixed left-0 top-0 h-screen scrollbar scrollbar-thumb-white scrollbar-track-white/10"
      >
        <div className="p-6">
          <h2 className="text-white text-xl font-bold mb-2">
            Hello, {userName || user.email}
          </h2>
          {isMod && targetUserId && (
            <p className="text-sm text-gray-600 mb-6">
              Modifying profile for: {targetUserId}
            </p>
          )}
        </div>
        <SidebarContent />
      </motion.aside>
    </>
  );
}
