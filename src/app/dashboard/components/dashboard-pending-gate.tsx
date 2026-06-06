"use client";

import PendingApproval from "@/app/dashboard/[userId]/pending-approval";
import { usePathname } from "next/navigation";

const PENDING_ALLOWED_SEGMENTS = ["visitor-data"];

type DashboardPendingGateProps = {
  isPendingLimitedAccess: boolean;
  displayName: string;
  children: React.ReactNode;
};

const DashboardPendingGate = ({
  isPendingLimitedAccess,
  displayName,
  children,
}: DashboardPendingGateProps) => {
  const pathname = usePathname();

  if (isPendingLimitedAccess) {
    const isAllowedRoute = PENDING_ALLOWED_SEGMENTS.some((segment) =>
      pathname.includes(`/${segment}`)
    );

    if (!isAllowedRoute) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <PendingApproval userName={displayName} />
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default DashboardPendingGate;
