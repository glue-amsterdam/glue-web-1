export type NavMenuItem = {
  section: string;
  label: string;
  className: string;
};

export type NavbarLink = {
  href: string;
  label: string;
};

const SECTION_HREF: Record<string, string> = {
  exhibitors: "/exhibitors",
  about: "/about",
  events: "/program",
  program: "/program",
  map: "/map",
};

const DEFAULT_NAV_LINKS: NavbarLink[] = [
  { label: "Exhibitors", href: "/exhibitors" },
  { label: "Map", href: "/map" },
  { label: "Program", href: "/program" },
  { label: "About", href: "/about" },
];

export const parseNavOrder = (className: string): number => {
  const parsed = parseInt(className, 10);
  return Number.isNaN(parsed) ? 999 : parsed;
};

export const buildNavbarLinks = (navMenu: NavMenuItem[]): NavbarLink[] => {
  const sortedMenu = [...navMenu].sort(
    (a, b) => parseNavOrder(a.className) - parseNavOrder(b.className)
  );

  const links = sortedMenu
    .map((item) => {
      const href = SECTION_HREF[item.section];
      if (!href) return null;
      return { href, label: item.label };
    })
    .filter((item): item is NavbarLink => item !== null);

  return links.length > 0 ? links : DEFAULT_NAV_LINKS;
};
