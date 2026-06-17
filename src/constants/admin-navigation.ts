export type AdminNavLink = {
  name: string;
  href: string;
  deprecated?: boolean;
  children?: AdminNavLink[];
};

export type AdminNavGroup = {
  id: string;
  title: string;
  links: AdminNavLink[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "web-management",
    title: "Web Management",
    links: [
      { name: "Base Data", href: "/admin/main" },
      { name: "Home", href: "/admin/home" },
      { name: "Visit", href: "/admin/visit" },
      { name: "Participate", href: "/admin/participate" },
      {
        name: "About",
        href: "/admin/about",
        children: [
          { name: "Team", href: "/admin/about?section=about-team" },
          { name: "Foundation", href: "/admin/about?section=about-foundation" },
          { name: "Mission", href: "/admin/about?section=about-mission" },
          { name: "Press", href: "/admin/about?section=about-press-media" },
          { name: "FAQ", href: "/admin/about?section=about-faq" },
        ],
      },
      { name: "Blog", href: "/admin/posts" },
      { name: "Program", href: "/admin/events" },
      { name: "Terms and Conditions", href: "/admin/terms" },
      { name: "Sign Up", href: "/admin/sign-up" },
      { name: "Sponsors", href: "/admin/sponsors" },
    ],
  },
  {
    id: "tour-management",
    title: "Tour Management",
    links: [
      { name: "Tour Management", href: "/admin/tour-management" },
      { name: "Plans", href: "/admin/plans" },
      { name: "Email Templates", href: "/admin/email-templates" },
      { name: "Visitors", href: "/admin/visitors" },
    ],
  },
  {
    id: "yearly-content",
    title: "Yearly Content",
    links: [{ name: "Yearly Content", href: "/admin/yearly-content" }],
  },
  {
    id: "deprecated-other",
    title: "Deprecated / Other",
    links: [
      {
        name: "Carousel (Deprecated)",
        href: "/admin/carousel",
        deprecated: true,
      },
    ],
  },
];

export const ADMIN_QUICK_LINKS: AdminNavLink[] = [
  { name: "Home", href: "/admin/home" },
  { name: "Blog", href: "/admin/posts" },
  { name: "Yearly Content", href: "/admin/yearly-content" },
  { name: "Base Data", href: "/admin/main" },
];

const normalizePath = (href: string) => href.split("?")[0];

const normalizeSearch = (href: string) => {
  const queryIndex = href.indexOf("?");
  if (queryIndex === -1) return "";
  return href.slice(queryIndex + 1);
};

export const isAdminNavLinkActive = (
  link: AdminNavLink,
  pathname: string,
  searchParams: URLSearchParams
) => {
  const linkPath = normalizePath(link.href);
  const linkSearch = normalizeSearch(link.href);

  if (linkSearch) {
    if (linkPath !== pathname) return false;
    const linkParams = new URLSearchParams(linkSearch);
    const section = searchParams.get("section");
    const linkSection = linkParams.get("section");

    if (linkSection === "about-team" && !section && pathname === "/admin/about") {
      return true;
    }

    for (const [key, value] of linkParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  }

  if (linkPath !== pathname) return false;

  if (link.children?.length) return false;

  if (pathname.startsWith(`${linkPath}/`)) return false;

  return true;
};

export const getAdminPageTitle = (
  pathname: string,
  searchParams: URLSearchParams
): string => {
  if (pathname === "/admin") return "Admin Panel";
  if (pathname === "/admin/posts/new") return "New Post";
  if (/^\/admin\/posts\/[^/]+$/.test(pathname) && pathname !== "/admin/posts/new") {
    return "Edit Post";
  }

  for (const group of ADMIN_NAV_GROUPS) {
    for (const link of group.links) {
      if (link.children?.length) {
        for (const child of link.children) {
          if (isAdminNavLinkActive(child, pathname, searchParams)) {
            return `${link.name} — ${child.name}`;
          }
        }
        if (pathname === normalizePath(link.href)) {
          return link.name;
        }
      }

      if (normalizePath(link.href) === pathname && !link.children?.length) {
        return link.name;
      }
    }
  }

  const fallback = pathname.split("/").filter(Boolean).pop();
  if (!fallback) return "Admin";
  return fallback.charAt(0).toUpperCase() + fallback.slice(1).replace(/-/g, " ");
};

export const getDefaultOpenGroups = (
  pathname: string,
  searchParams: URLSearchParams
): string[] => {
  const openGroups = new Set<string>(["web-management"]);

  for (const group of ADMIN_NAV_GROUPS) {
    for (const link of group.links) {
      const linkPath = normalizePath(link.href);
      if (linkPath === pathname) {
        openGroups.add(group.id);
      }
      if (link.children?.some((child) => isAdminNavLinkActive(child, pathname, searchParams))) {
        openGroups.add(group.id);
      }
    }
  }

  return Array.from(openGroups);
};
