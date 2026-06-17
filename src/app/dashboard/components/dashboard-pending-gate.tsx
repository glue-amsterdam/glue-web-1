"use client";

import ParticipantRequestPendingBanner from "@/app/dashboard/[userId]/pending-approval";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PENDING_ALLOWED_SEGMENTS = ["visitor-data"];

type DashboardPendingGateProps = {
  isPendingLimitedAccess: boolean;
  displayName: string;
  targetUserId: string;
  children: React.ReactNode;
};

const DashboardPendingGate = ({
  isPendingLimitedAccess,
  displayName,
  targetUserId,
  children,
}: DashboardPendingGateProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isAllowedRoute = PENDING_ALLOWED_SEGMENTS.some((segment) =>
    pathname.includes(`/${segment}`)
  );
  const visitorDataPath = `/dashboard/${targetUserId}/visitor-data`;

  useEffect(() => {
    if (isPendingLimitedAccess && !isAllowedRoute) {
      router.replace(visitorDataPath);
    }
  }, [isPendingLimitedAccess, isAllowedRoute, router, visitorDataPath]);

  if (isPendingLimitedAccess && !isAllowedRoute) {
    return null;
  }

  if (isPendingLimitedAccess) {
    return (
      <div className="mini-padding px-6">
        <ParticipantRequestPendingBanner userName={displayName} />
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default DashboardPendingGate;
