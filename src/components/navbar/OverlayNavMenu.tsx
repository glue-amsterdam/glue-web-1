"use client";

import { useAuth } from "@/app/context/AuthContext";
import type { MainMenuItem, SubItem } from "@/schemas/mainSchema";
import { Link } from "next-view-transitions";
import { useTransitionRouter } from "next-view-transitions";
import type React from "react";
import { useState, useCallback } from "react";
import LoginForm from "@/app/components/login-form/login-form";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

type Props = {
  navItems: MainMenuItem[];
  closeOverlay: () => void;
  handleLoginModal: (e: React.MouseEvent) => void;
};

export function OverlayNavMenu({
  navItems,
  closeOverlay,
  handleLoginModal,
}: Props) {
  const router = useTransitionRouter();
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleRedirect = useCallback(
    (e: React.MouseEvent, section: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (section === "dashboard") {
        if (user) {
          closeOverlay();
          setTimeout(() => {
            router.push(`/dashboard/${user.id}/user-data`);
          }, 100);
        } else {
          setIsLoginModalOpen(true);
        }
      } else {
        closeOverlay();
        router.push(`/${section}`);
      }
    },
    [user, router, closeOverlay]
  );

  const sortSubItems = useCallback(
    (subItems: SubItem[] | null | undefined): SubItem[] => {
      if (!subItems) return [];
      return [...subItems].sort((a, b) => a.place - b.place);
    },
    []
  );

  const handleLoginSuccess = useCallback(
    (loggedInUser: User) => {
      setIsLoginModalOpen(false);
      closeOverlay();
      setTimeout(() => {
        router.push(`/dashboard/${loggedInUser.id}/user-data`);
      }, 100);
    },
    [router, closeOverlay]
  );

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleSubItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.stopPropagation();
      closeOverlay();
    },
    [closeOverlay]
  );
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex-1 h-full m-auto flex flex-col justify-between px-10 overflow-y-auto">
      <div className="text-black">
        {user ? (
          <div className="flex flex-col items-end gap-2">
            <Link
              className="hover:scale-105 transition-all duration-100"
              href={`/dashboard/${user?.id}/user-data`}
            >
              My GLUE account
            </Link>
            <button
              className="hover:scale-105 transition-all duration-100"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <button
              className="hover:scale-105 transition-all duration-100"
              onClick={handleLoginModal}
              type="button"
            >
              Log In
            </button>
            <Link
              className="hover:scale-105 transition-all duration-100"
              href="/signup?step=1"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-evenly sm:grid sm:grid-cols-2 auto-rows-fr grid-rows-3 gap-1 md:gap-4 h-full">
        {navItems.map((item, i) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const visibleSubItems = hasSubItems
            ? sortSubItems(item.subItems).filter(
                (subItem) => subItem.is_visible
              )
            : [];

          return (
            <div
              key={item.section + i}
              className={cn(
                "w-full group",
                item.section === "about" && "row-span-3"
              )}
            >
              <button
                type="button"
                aria-label={item.label}
                onClick={(e) => handleRedirect(e, item.section)}
                className="w-full hover:scale-105  flex items-center justify-center text-left bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-lg transition-all duration-200 min-h-[60px] touch-manipulation"
              >
                <span className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-overpass font-medium text-black">
                  {item.label}
                </span>
              </button>

              {hasSubItems && (
                <div className="transition-all duration-200 h-fit flex flex-col justify-between">
                  <ul>
                    {visibleSubItems.map((subItem, j) => (
                      <li key={subItem.href + j}>
                        <Link
                          href={`/${item.section}#${subItem.href}`}
                          className="block text-sm rounded-md active:bg-gray-200 duration-200 text-gray-700 font-medium text-center hover:scale-95 transition-all text-pretty break-words"
                          onClick={handleSubItemClick}
                        >
                          <span className="italic font-overpass text-xs md:text-sm lg:text-base">
                            {subItem.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
