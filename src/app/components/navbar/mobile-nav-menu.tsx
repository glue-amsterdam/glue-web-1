"use client";

import { useAuth } from "@/app/context/AuthContext";
import type { MainMenuItem, SubItem } from "@/schemas/mainSchema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import {
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import LoginForm from "@/app/components/login-form/login-form";
import type { User } from "@supabase/supabase-js";

type Props = {
  navItems: MainMenuItem[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export function MobileNavMenu({ navItems, setIsOpen }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleRedirect = useCallback(
    (e: React.MouseEvent, section: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (section === "dashboard") {
        if (user) {
          setIsOpen(false);
          setTimeout(() => {
            router.push(`/dashboard/${user.id}/user-data`);
          }, 100);
        } else {
          setIsLoginModalOpen(true);
        }
      } else {
        setIsOpen(false);
        router.push(`/${section}`);
      }
    },
    [user, router, setIsOpen]
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
      setIsOpen(false);
      setTimeout(() => {
        router.push(`/dashboard/${loggedInUser.id}/user-data`);
      }, 100);
    },
    [router, setIsOpen]
  );

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleSubItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Prevent event bubbling to avoid interference with map click handlers
      e.stopPropagation();
      setIsOpen(false);
    },
    [setIsOpen]
  );

  return (
    <div className="relative">
      <ul className="space-y-2">
        {navItems.map((item, i) => (
          <li key={item.section + i}>
            <button
              type="button"
              onClick={(e) => handleRedirect(e, item.section)}
              className="text-lg px-2 w-full py-1 hover:bg-accent rounded-md text-left"
            >
              {item.label}
            </button>
            {item.subItems && (
              <ul className="ml-4 mt-1 space-y-1">
                {sortSubItems(item.subItems).map(
                  (subItem, j) =>
                    subItem.is_visible && (
                      <li key={subItem.href + j}>
                        <Link
                          href={`/${item.section}#${subItem.href}`}
                          className="block text-xs px-2 py-1 hover:bg-accent rounded-md"
                          onClick={handleSubItemClick}
                        >
                          {subItem.title}
                        </Link>
                      </li>
                    )
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
