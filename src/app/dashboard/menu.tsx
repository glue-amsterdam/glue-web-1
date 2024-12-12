"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import {
  ADMIN_DASHBOARD_SECTIONS,
  NAVBAR_HEIGHT,
  USER_DASHBOARD_SECTIONS,
} from "@/constants";
import { User } from "@supabase/supabase-js";
import { useDashboardUserContext } from "@/app/context/UserDashboardContext";

interface ExtendedUser extends User {
  is_mod?: boolean;
  userType?: string;
  user_name?: string;
}

export default function DashboardMenu({
  loggedInUser,
}: {
  loggedInUser: ExtendedUser;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { userId: targetUserId } = useDashboardUserContext();

  const SidebarContent = () => (
    <nav className=" space-y-2">
      {USER_DASHBOARD_SECTIONS.map((item, index) => (
        <Link
          className="cursor-pointer"
          key={index}
          href={`/dashboard/${targetUserId}/${item.href}`}
        >
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setIsSidebarOpen(false)}
          >
            <item.icon className="size-6 mb-2" />
            <label>{item.label}</label>
          </Button>
        </Link>
      ))}
      {loggedInUser.is_mod && (
        <>
          <h3 className="text-white text-sm pb-2">Mod Section</h3>
          {ADMIN_DASHBOARD_SECTIONS.map((item, index) => (
            <Link
              className="cursor-pointer"
              key={index}
              href={`/dashboard/${targetUserId}/${item.href}`}
            >
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="size-6 mb-2" />
                <label>{item.label}</label>
              </Button>
            </Link>
          ))}
        </>
      )}
    </nav>
  );

  return (
    <>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden bg-white/80 rounded-none z-50 text-black hover:text-black/80"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-uiblack">
          <h2 className="text-white text-center">
            Hello {loggedInUser.user_name || loggedInUser.email}
          </h2>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <motion.aside
        initial={{ opacity: 0, x: -150 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: "keyframes" }}
        style={{ paddingTop: `${NAVBAR_HEIGHT / 2}rem` }}
        className="hidden md:block w-64 bg-uiblack shadow-md"
      >
        <h2 className="text-white text-center">
          Hello {loggedInUser.user_name || loggedInUser.email}
        </h2>
        <SidebarContent />
      </motion.aside>
    </>
  );
}
