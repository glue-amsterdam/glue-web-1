"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Team", section: "about-team" },
  { name: "Foundation", section: "about-foundation" },
  { name: "Mission", section: "about-mission" },
  { name: "Press", section: "about-press-media" },
  { name: "FAQ", section: "about-faq" },
];

interface AboutSectionSelectorProps {
  currentSection: string;
}

export default function AdminAboutSelector({
  currentSection,
}: AboutSectionSelectorProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto">
      {navItems.map((item) => {
        const isActive = currentSection === item.section;

        return (
          <Link
            key={item.section}
            href={`?section=${item.section}`}
            className={cn(
              "rounded-md px-4 py-2 font-medium transition-colors duration-200 ease-in-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-(--primary-color) text-(--white-color)"
                : "text-(--black-color) hover:text-(--primary-color)"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
