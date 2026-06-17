import type { NavbarIdentity } from "@/lib/users/get-navbar-identity";

export const fetchNavbarIdentity = async (): Promise<NavbarIdentity | null> => {
  try {
    const res = await fetch("/api/users/dashboard-home", {
      credentials: "include",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return null;
    }

    return {
      dashboardHref: typeof data?.href === "string" ? data.href : null,
      isParticipant: data.isParticipant === true,
      isVisitorOnly: data.isVisitorOnly === true,
    };
  } catch {
    return null;
  }
};
