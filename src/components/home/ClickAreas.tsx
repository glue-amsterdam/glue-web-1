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
            return (
              <li
                key={area.section}
                ref={refs.buttonsAreaRef}
                className={`absolute button-area hover:bg-white/10 ${area.className} group`}
              >
                <div className="block w-full h-full">
                  {!mainMenu || mainMenu.length < 4 ? (
                    <div>Problems with menu items, not enough</div>
                  ) : (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative w-[90%] md:w-[85%] h-[60%]">
                        {/* LEFT BUTTON */}
                        <div className="w-[12vh] md:w-[30vw] navLabel absolute left-0 top-1/2 -translate-y-1/2 text-start">
                          <HomeAreaButton label={mainMenu[0]?.label} />
                        </div>
                        {/* RIGHT BUTTON */}
                        <div className="navLabel absolute right-0 top-1/2 -translate-y-1/2">
                          <HomeAreaButton label={mainMenu[2]?.label} />
                        </div>
                        {/* UPPER BUTTON */}
                        <div className="navLabel absolute top-0 left-1/2 -translate-x-1/2">
                          <HomeAreaButton label={mainMenu[1]?.label} />
                        </div>
                        {/* DOWN BUTTON */}
                        <div className="navLabel absolute bottom-0 right-1/2 translate-x-1/2">
                          <HomeAreaButton label={mainMenu[3]?.label} />
                        </div>
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
                  onClick={(e) => {
                    if (area.className === "leftbutton") {
                      if (requiresAuth && !user) {
                        e.preventDefault();
                        setIsLoginModalOpen(true);
                        return;
                      }
                      const href = user
                        ? `/dashboard/${user.id}/user-data`
                        : "#";
                      if (href !== "#") {
                        document.documentElement.dataset.to = "leftButton";
                        homeExitAnimation({
                          refs,
                          buttonType: "leftButton",
                        }).then(() => {
                          router.push(href);
                        });
                      }
                    } else if (area.className === "upperbutton") {
                      document.documentElement.dataset.to = "upButton";
                      homeExitAnimation({ refs, buttonType: "upButton" }).then(
                        () => {
                          router.push("/events");
                        }
                      );
                    } else if (area.className === "rightbutton") {
                      document.documentElement.dataset.to = "rightButton";
                      homeExitAnimation({
                        refs,
                        buttonType: "rightButton",
                      }).then(() => {
                        router.push("/map");
                      });
                    } else if (area.className === "downbutton") {
                      document.documentElement.dataset.to = "downButton";
                      homeExitAnimation({
                        refs,
                        buttonType: "downButton",
                      }).then(() => {
                        router.push("/about");
                      });
                    }
                  }}
                />
              </li>
            );
          })}
      </ul>
    </nav>
  );
}

export default ClickAreas;
