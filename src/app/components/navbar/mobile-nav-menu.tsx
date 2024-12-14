import { SheetClose } from "@/components/ui/sheet";
import { MainMenuItem } from "@/schemas/mainSchema";
import Link from "next/link";
import React from "react";

export function MobileNavMenu({ navItems }: { navItems: MainMenuItem[] }) {
  return (
    <ul className="space-y-2">
      {navItems.map((item, i) => (
        <li key={item.section + i}>
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
              {item.subItems.map((subItem, i) => (
                <li key={subItem.href + i}>
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
