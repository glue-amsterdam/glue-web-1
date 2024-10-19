import MemberAdminSection from "@/app/components/dashboard/member-admin-section";
import { Metadata } from "next";
import { Suspense } from "react";
import Background from "@/app/components/background";

export const metadata: Metadata = {
  title: "GLUE - Dashboard",
};

function DashboardPage() {
  return (
    <>
      <Suspense>
        <MemberAdminSection />
      </Suspense>
      <div className="fixed inset-0 overflow-x-hidden overflow-y-scroll -z-10">
        <Background />
      </div>
    </>
  );
}

export default DashboardPage;
