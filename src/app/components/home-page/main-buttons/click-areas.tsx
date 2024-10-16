"use client";

import { MainMenu } from "@/utils/menu-types";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "../../login-form/auth-context";
import { useRouter } from "next/navigation";
import { LoginForm } from "../../login-form/login-form";

function ClickAreasClient({ clickAreas }: { clickAreas: MainMenu[] }) {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  return (
    <>
      <nav className="fixed inset-0 z-30">
        <ul className="h-full w-full">
          {clickAreas.map((area) => (
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
                aria-labelledby={`label-${area.section}`}
              />
            </li>
          ))}
        </ul>

        <Labels clickAreas={clickAreas} />
      </nav>
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
}

function Labels({ clickAreas }: { clickAreas: MainMenu[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative w-[90%] md:w-[85%] h-[60%]">
        <div className="absolute flex h-full w-full items-center justify-evenly">
          <div className="w-[12vh] md:w-[30vw]">
            <span
              id={`label-${clickAreas[0]?.section}`}
              className="navLabel break-words"
            >
              {clickAreas[0]?.label}
            </span>
          </div>
          <span
            id={`label-${clickAreas[2]?.section}`}
            className="navLabel break-words flex justify-end"
          >
            {clickAreas[2]?.label}
          </span>
        </div>
        <div className="absolute flex h-full w-full flex-col items-center">
          <span
            id={`label-${clickAreas[1]?.section}`}
            className="navLabel break-words"
          >
            {clickAreas[1]?.label}
          </span>
          <span
            id={`label-${clickAreas[3]?.section}`}
            className="navLabel break-words flex items-end"
          >
            {clickAreas[3]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClickAreasClient;
