export const fetchDashboardHomeHref = async (): Promise<string | null> => {
  try {
    const res = await fetch("/api/users/dashboard-home", {
      credentials: "include",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return typeof data?.href === "string" ? data.href : null;
  } catch {
    return null;
  }
};
