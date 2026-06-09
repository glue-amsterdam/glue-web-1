"use client";

import { useTransitionRouter } from "next-view-transitions";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoginForm from "@/app/components/login-form/login-form";
import type { MainMenuItem } from "@/schemas/mainSchema";
import CenteredLoader from "@/app/components/centered-loader";
import { User } from "@supabase/supabase-js";
import { HomeExitAnimationRefs } from "@/lib/animations/home/home-about-exit-animation";
import { fetchDashboardHomeHref } from "@/lib/users/fetch-dashboard-home";
import ClickAreas from "./ClickAreas";

export default function HomeWrapper({
  refs,
  mainMenu,
}: {
  refs: HomeExitAnimationRefs;
  mainMenu: MainMenuItem[];
}) {
  const router = useTransitionRouter();
  const nextRouter = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const reopenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    return () => {
      if (reopenTimeoutRef.current) {
        clearTimeout(reopenTimeoutRef.current);
        reopenTimeoutRef.current = null;
      }
    };
  }, []);

  const handleLoginSuccess = async (loggedInUser: User) => {
    setIsLoginModalOpen(false);
    if (pathname === "/") {
      const href =
        (await fetchDashboardHomeHref()) ??
        `/dashboard/${loggedInUser.id}/visitor-data`;
      router.push(href);
    } else {
      nextRouter.refresh();
    }
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  if (!mainMenu || !Array.isArray(mainMenu)) {
    return <CenteredLoader />;
  }

  return (
    <nav>
      <ClickAreas
        refs={refs}
        mainMenu={mainMenu}
        setIsLoginModalOpen={setIsLoginModalOpen}
      />
      <LoginForm
        hasPrev={true}
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
}
