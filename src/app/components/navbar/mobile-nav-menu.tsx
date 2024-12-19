"use client";

import { SheetClose } from "@/components/ui/sheet";
import { MainMenuItem } from "@/schemas/mainSchema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export function MobileNavMenu({ navItems }: { navItems: MainMenuItem[] }) {
  const router = useRouter();

  const handleRedirect = (section: string) => {
    router.push(`/${section}`);
  };

  const filteredNav = navItems.filter((s) => s.section !== "dashboard");

  return (
    <ul className="space-y-2">
      {filteredNav.map((item, i) => (
        <li key={item.section + i}>
          <SheetClose asChild>
            <button
              type="button"
              onClick={() => handleRedirect(item.section)}
              className="text-lg px-2 w-full py-1 hover:bg-accent rounded-md text-left"
            >
              {item.label}
            </button>
          </SheetClose>
          {item.subItems && (
            <ul className="ml-4 mt-1 space-y-1">
              {item.subItems.map((subItem, j) => (
                <li key={subItem.href + j}>
                  <SheetClose asChild>
                    <Link
                      href={`/${item.section}#${subItem.href}`}
                      className="block text-xs px-2 py-1 hover:bg-accent rounded-md"
                    >
                      {subItem.title}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
