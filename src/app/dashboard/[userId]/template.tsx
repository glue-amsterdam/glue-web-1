"use client";

import { useDashboardContext } from "@/app/context/DashboardContext";
import PendingApproval from "@/app/dashboard/[userId]/pending-approval";
import { usePathname } from "next/navigation";

const PENDING_ALLOWED_SEGMENTS = ["visitor-data", "qr-code"];

export default function DashboardSegmentTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isPendingLimitedAccess, displayName } = useDashboardContext();

  if (isPendingLimitedAccess) {
    const isAllowedRoute = PENDING_ALLOWED_SEGMENTS.some((segment) =>
      pathname.includes(`/${segment}`)
    );

    if (!isAllowedRoute) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <PendingApproval userName={displayName ?? ""} />
        </div>
      );
    }
  }

  return <>{children}</>;
}
