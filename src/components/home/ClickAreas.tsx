"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useMenu } from "@/app/context/MainContext";
import { useTransitionRouter } from "next-view-transitions";
import React from "react";
import {
  homeExitAnimation,
  HomeExitAnimationRefs,
} from "@/lib/animations/home/home-about-exit-animation";
import HomeAreaButton from "./HomeAreaButton";

interface ClickAreasProps {
  setIsLoginModalOpen: (isOpen: boolean) => void;
  refs: HomeExitAnimationRefs;
}

function ClickAreas({ setIsLoginModalOpen, refs }: ClickAreasProps) {
  const mainMenu = useMenu();
  const { user } = useAuth();
  const router = useTransitionRouter();
  const orderedSections = ["dashboard", "events", "map", "about"];

  const handleAreaClick = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    requiresAuth: boolean,
    href: string
  ) => {
    if (requiresAuth && !user) {
      e.preventDefault();
      setIsLoginModalOpen(true);
      return;
    }
    if (href && href !== "#") {
      e.preventDefault();

      if (href === "/about") {
        document.documentElement.dataset.to = "about";
      } else if (href === "/events") {
        document.documentElement.dataset.to = "events";
      } else if (href === "/map") {
        document.documentElement.dataset.to = "map";
      } else if (href.startsWith("/dashboard")) {
        document.documentElement.dataset.to = "dashboard";
      }

      await homeExitAnimation({ refs, href });
      router.push(href);
    }
  };

  const handleAreaKeyDown = async (
    e: React.KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>,
    requiresAuth: boolean,
    href: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      if (requiresAuth && !user) {
        e.preventDefault();
        setIsLoginModalOpen(true);
        return;
      }
      if (href && href !== "#") {
        e.preventDefault();

        // Configurar el dataset.to antes de la animación
        if (href === "/about") {
          document.documentElement.dataset.to = "about";
        } else if (href === "/events") {
          document.documentElement.dataset.to = "events";
        } else if (href === "/map") {
          document.documentElement.dataset.to = "map";
        } else if (href.startsWith("/dashboard")) {
          document.documentElement.dataset.to = "dashboard";
        }

        await homeExitAnimation({ refs, href });
        router.push(href);
      }
    }
  };

  const sortedMenu = mainMenu.sort(
    (a, b) =>
      orderedSections.indexOf(a.section) - orderedSections.indexOf(b.section)
  );

  return (
    <nav aria-label="Main navigation">
      <ul className="h-full w-full">
        {sortedMenu
          .filter((area) => area?.section && area.className)
          .map((area) => {
            const requiresAuth = area.section === "dashboard";
            let targetHref = `/${area.section}`;
            if (requiresAuth && user?.id) {
              targetHref = `/dashboard/${user.id}/user-data`;
            }
            if (requiresAuth && !user) {
              targetHref = "#";
            }
            return (
              <li
                key={area.section}
                ref={refs.buttonsAreaRef}
                className={`absolute button-area hover:bg-white/10 ${area.className}`}
              >
                <div className="block w-full h-full group">
                  {!mainMenu || mainMenu.length < 4 ? (
                    <div>Problems with menu items, not enough</div>
                  ) : (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative w-[90%] md:w-[85%] h-[60%]">
                        {/* DASHBOARD BUTTON */}
                        <HomeAreaButton
                          label={mainMenu[0]?.label}
                          section={mainMenu[0]?.section}
                          className="w-[12vh] md:w-[30vw] navLabel absolute left-0 top-1/2 -translate-y-1/2 text-start"
                          onClick={(e) =>
                            handleAreaClick(
                              e,
                              true,
                              user ? `/dashboard/${user.id}/user-data` : "#"
                            )
                          }
                          onKeyDown={(e) =>
                            handleAreaKeyDown(
                              e,
                              true,
                              user ? `/dashboard/${user.id}/user-data` : "#"
                            )
                          }
                          ariaLabel={mainMenu[0]?.label}
                        />
                        {/* EVENTS BUTTON */}
                        <HomeAreaButton
                          label={mainMenu[2]?.label}
                          section={mainMenu[2]?.section}
                          className="navLabel absolute right-0 top-1/2 -translate-y-1/2"
                          onClick={(e) => handleAreaClick(e, false, "/events")}
                          onKeyDown={(e) =>
                            handleAreaKeyDown(e, false, "/events")
                          }
                          ariaLabel={mainMenu[2]?.label}
                        />
                        {/* ABOUT BUTTON */}
                        <HomeAreaButton
                          label={mainMenu[1]?.label}
                          section={mainMenu[1]?.section}
                          className="navLabel absolute top-0 left-1/2 -translate-x-1/2"
                          onClick={(e) => handleAreaClick(e, false, "/about")}
                          onKeyDown={(e) =>
                            handleAreaKeyDown(e, false, "/about")
                          }
                          ariaLabel={mainMenu[1]?.label}
                        />
                        {/* MAP BUTTON */}
                        <HomeAreaButton
                          label={mainMenu[3]?.label}
                          section={mainMenu[3]?.section}
                          className="navLabel absolute bottom-0 right-1/2 translate-x-1/2"
                          onClick={(e) => handleAreaClick(e, false, "/map")}
                          onKeyDown={(e) => handleAreaKeyDown(e, false, "/map")}
                          ariaLabel={mainMenu[3]?.label}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  tabIndex={0}
                  role="button"
                  aria-label={area.label}
                  aria-labelledby={`label-${area?.section}`}
                  className="absolute inset-0 w-full h-full z-10"
                  onClick={(e) => handleAreaClick(e, requiresAuth, targetHref)}
                  onKeyDown={(e) =>
                    handleAreaKeyDown(e, requiresAuth, targetHref)
                  }
                />
              </li>
            );
          })}
      </ul>
    </nav>
  );
}

export default ClickAreas;
