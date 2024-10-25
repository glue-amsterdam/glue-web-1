"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/app/components/login-form/login-form";
import { useAuth } from "@/app/context/AuthContext";
import { useMenu } from "@/app/context/MainContext";
import CenteredLoader from "@/app/components/centered-loader";
import { MainSection } from "@/utils/menu-types";

function ClickAreas() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const mainMenu = useMenu();

  const handleAreaClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    requiresAuth: boolean
  ) => {
    e.preventDefault();
    if (requiresAuth && !user) {
      setIsLoginModalOpen(true);
    } else {
      router.push(href);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (!mainMenu || !Array.isArray(mainMenu)) {
    return <CenteredLoader />;
  }

  return (
    <nav className="fixed inset-0 z-30">
      <ul className="h-full w-full">
        {mainMenu
          .filter((area) => area?.section && area.className)
          .map((area) => (
            <li key={area.section} className={`absolute ${area.className}`}>
              <Link
                href={`/${area.section}`}
                onClick={(e) =>
                  handleAreaClick(
                    e,
                    `/${area.section}`,
                    area.section === "dashboard"
                  )
                }
                className="block w-full h-full"
                aria-labelledby={`label-${area?.section}`}
              />
            </li>
          ))}
      </ul>
      <Labels mainMenu={mainMenu} />
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </nav>
  );
}

function Labels({ mainMenu }: { mainMenu: MainSection["mainMenu"] }) {
  if (!mainMenu || mainMenu.length < 4) {
    return <div>Problems with menu items, not enough</div>;
  }
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative w-[90%] md:w-[85%] h-[60%]">
        <div className="absolute flex h-full w-full items-center justify-evenly">
          <div className="w-[12vh] md:w-[30vw]">
            <span
              id={`label-${mainMenu[0]?.section}`}
              className="navLabel break-words"
            >
              {mainMenu[0]?.label}
            </span>
          </div>
          <span
            id={`label-${mainMenu[2]?.section}`}
            className="navLabel break-words flex justify-end"
          >
            {mainMenu[2]?.label}
          </span>
        </div>
        <div className="absolute flex h-full w-full flex-col items-center">
          <span
            id={`label-${mainMenu[1]?.section}`}
            className="navLabel break-words"
          >
            {mainMenu[1]?.label}
          </span>
          <span
            id={`label-${mainMenu[3]?.section}`}
            className="navLabel break-words flex items-end"
          >
            {mainMenu[3]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClickAreas;
