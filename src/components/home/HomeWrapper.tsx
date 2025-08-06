"use client";

import { useTransitionRouter } from "next-view-transitions";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import LoginForm from "@/app/components/login-form/login-form";
import { useMenu } from "@/app/context/MainContext";
import CenteredLoader from "@/app/components/centered-loader";
import { User } from "@supabase/supabase-js";
import { HomeExitAnimationRefs } from "@/lib/animations/home/home-about-exit-animation";
import ClickAreas from "./ClickAreas";

export default function HomeWrapper({ refs }: { refs: HomeExitAnimationRefs }) {
  const router = useTransitionRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();
  const mainMenu = useMenu();

  const handleLoginSuccess = (loggedInUser: User) => {
    setIsLoginModalOpen(false);
    if (pathname === "/") {
      const finalHref = `/dashboard/${loggedInUser.id}/user-data`;
      router.push(finalHref);
    } else {
      router.refresh();
    }
  };

  if (!mainMenu || !Array.isArray(mainMenu)) {
    return <CenteredLoader />;
  }

  return (
    <nav>
      <ClickAreas refs={refs} setIsLoginModalOpen={setIsLoginModalOpen} />
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
}
