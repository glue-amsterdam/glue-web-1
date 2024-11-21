import { SheetClose } from "@/components/ui/sheet";
import { MainMenuItem } from "@/utils/menu-types";
import Link from "next/link";
import React from "react";

export function MobileNavMenu({ navItems }: { navItems: MainMenuItem[] }) {
  return (
    <ul className="space-y-2">
      {navItems.map((item) => (
        <li key={item.section}>
          <SheetClose asChild>
            <Link
              href={`/${item.section}`}
              className="block text-lg px-2 border-b py-1 hover:bg-accent rounded-md"
            >
              {item.label}
            </Link>
          </SheetClose>
          {item.subItems && (
            <ul className="ml-4 mt-1 space-y-1">
              {item.subItems.map((subItem) => (
                <li key={subItem.href}>
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
