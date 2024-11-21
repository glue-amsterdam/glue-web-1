"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/login-form/login-form";
import { useAuth } from "@/app/context/AuthContext";
import { useMenu } from "@/app/context/MainContext";
import CenteredLoader from "@/app/components/centered-loader";
import { MainSection } from "@/utils/menu-types";
import { LoggedInUserType } from "@/schemas/usersSchemas";

function ClickAreas() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  const { user } = useAuth();
  const mainMenu = useMenu();

  const handleAreaClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    requiresAuth: boolean
  ) => {
    e.preventDefault();
    if (requiresAuth && !user) {
      setIsLoginModalOpen(true);
    } else if (requiresAuth && user?.userId) {
      router.push(`/dashboard/${user.userId}/user-data`);
    } else {
      router.push(href);
    }
  };

  const handleLoginSuccess = (user: LoggedInUserType) => {
    router.push(`/dashboard/${user.userId}/user-data`);
  };

  const orderedSections = ["dashboard", "about", "events", "map"];

  if (!mainMenu || !Array.isArray(mainMenu)) {
    return <CenteredLoader />;
  }

  const sortedMenu = mainMenu.sort(
    (a, b) =>
      orderedSections.indexOf(a.section) - orderedSections.indexOf(b.section)
  );

  return (
    <nav>
      <ul className="h-full w-full ">
        {sortedMenu
          .filter((area) => area?.section && area.className)
          .map((area) => (
            <li
              key={area.section}
              className={`absolute hover:bg-white/10 transition-all duration-300 ${area.className}`}
            >
              <Link
                href={`#`}
                onClick={(e) =>
                  handleAreaClick(
                    e,
                    `/${area.section}`,
                    area.section === "dashboard"
                  )
                }
                className="block w-full h-full group"
                aria-labelledby={`label-${area?.section}`}
              >
                <Labels mainMenu={mainMenu} />
              </Link>
            </li>
          ))}
      </ul>
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
          <div className="w-[12vh] group-hover:scale-105 md:w-[30vw] transition-all">
            <span
              id={`label-${mainMenu[0]?.section}`}
              className="navLabel break-words"
            >
              {mainMenu[0]?.label}
            </span>
          </div>
          <span
            id={`label-${mainMenu[2]?.section}`}
            className="navLabel break-words flex justify-end group-hover:scale-105 transition-all"
          >
            {mainMenu[2]?.label}
          </span>
        </div>
        <div className="absolute flex h-full w-full flex-col items-center">
          <span
            id={`label-${mainMenu[1]?.section}`}
            className="navLabel break-words group-hover:scale-105 transition-all"
          >
            {mainMenu[1]?.label}
          </span>
          <span
            id={`label-${mainMenu[3]?.section}`}
            className="navLabel break-words flex items-end group-hover:scale-105 transition-all"
          >
            {mainMenu[3]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClickAreas;
