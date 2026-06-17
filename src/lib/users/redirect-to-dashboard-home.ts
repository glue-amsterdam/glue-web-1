import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const getVisitorDataDashboardPath = (userId: string): string =>
  `/dashboard/${userId}/visitor-data`;

export type RedirectToDashboardHomeOptions = {
  router: AppRouterInstance;
  userId: string;
  hasRedirectedRef: { current: boolean };
  href?: string | null;
};

export const redirectToDashboardHome = ({
  router,
  userId,
  hasRedirectedRef,
  href,
}: RedirectToDashboardHomeOptions): boolean => {
  if (hasRedirectedRef.current) {
    return false;
  }

  hasRedirectedRef.current = true;
  router.replace(href ?? getVisitorDataDashboardPath(userId));
  return true;
};
