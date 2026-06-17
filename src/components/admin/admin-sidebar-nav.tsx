"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ADMIN_NAV_GROUPS,
  getDefaultOpenGroups,
  isAdminNavLinkActive,
  type AdminNavLink,
} from "@/constants/admin-navigation";
import { cn } from "@/lib/utils";

type AdminSidebarNavProps = {
  onNavigate?: () => void;
};

const AdminNavLinkItem = ({
  link,
  onNavigate,
  depth = 0,
}: {
  link: AdminNavLink;
  onNavigate?: () => void;
  depth?: number;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = isAdminNavLinkActive(link, pathname, searchParams);

  return (
    <li>
      <Link
        href={link.href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "block rounded-md px-3 py-2 base-text-size transition-colors",
          depth > 0 && "pl-6",
          link.deprecated
            ? "border border-amber-200 text-amber-800 hover:bg-amber-50"
            : isActive
              ? "bg-zinc-100 font-medium text-zinc-900"
              : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
        )}
      >
        {link.name}
      </Link>
      {link.children?.length ? (
        <ul className="mt-1 space-y-1">
          {link.children.map((child) => (
            <AdminNavLinkItem
              key={child.href}
              link={child}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export const AdminSidebarNav = ({ onNavigate }: AdminSidebarNavProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultOpenGroups = getDefaultOpenGroups(pathname, searchParams);

  return (
    <Accordion
      type="multiple"
      defaultValue={[]}
      className="space-y-1"
    >
      {ADMIN_NAV_GROUPS.map((group) => (
        <AccordionItem
          key={group.id}
          value={group.id}
          className="border-b border-zinc-200 border-b-0"
        >
          <AccordionTrigger className="base-text-size py-3 font-semibold uppercase tracking-wide text-zinc-500 hover:no-underline hover:text-zinc-700">
            {group.title}
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <nav aria-label={group.title}>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <AdminNavLinkItem
                    key={link.href}
                    link={link}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </nav>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
