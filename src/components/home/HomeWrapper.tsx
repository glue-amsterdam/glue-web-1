"use client";

import { useTransitionRouter } from "next-view-transitions";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoginForm, {
  type LoginFormCloseReason,
} from "@/app/components/login-form/login-form";
import { useMenu } from "@/app/context/MainContext";
import CenteredLoader from "@/app/components/centered-loader";
import { User } from "@supabase/supabase-js";
import { HomeExitAnimationRefs } from "@/lib/animations/home/home-about-exit-animation";
import ClickAreas from "./ClickAreas";

export default function HomeWrapper({ refs }: { refs: HomeExitAnimationRefs }) {
  const router = useTransitionRouter();
  const nextRouter = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const reopenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const mainMenu = useMenu();

  useEffect(() => {
    return () => {
      if (reopenTimeoutRef.current) {
        clearTimeout(reopenTimeoutRef.current);
        reopenTimeoutRef.current = null;
      }
    };
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setIsLoginModalOpen(false);
    if (pathname === "/") {
      const finalHref = `/dashboard/${loggedInUser.id}/user-data`;
      router.push(finalHref);
    } else {
      nextRouter.refresh();
    }
  };

  const handleCloseLoginModal = (reason?: LoginFormCloseReason) => {
    if (reason === "visitor-restored") {
      if (reopenTimeoutRef.current) {
        clearTimeout(reopenTimeoutRef.current);
        reopenTimeoutRef.current = null;
      }
      setIsLoginModalOpen(false);
      return;
    }

    setIsLoginModalOpen(false);
  };

  if (!mainMenu || !Array.isArray(mainMenu)) {
    return <CenteredLoader />;
  }

  return (
    <nav>
      <ClickAreas refs={refs} setIsLoginModalOpen={setIsLoginModalOpen} />
      <LoginForm
        hasPrev={true}
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
}
