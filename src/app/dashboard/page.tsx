import BackgroundGrid from "@/app/components/background-grid";
import LogoMain from "@/app/components/home-page/logo-main";
import MemberAdminSection from "../components/dashboard/member-admin-section";

function DashboardPage() {
  return (
    <>
      <MemberAdminSection />
      <div className="fixed inset-0 overflow-x-hidden overflow-y-scroll -z-10">
        <LogoMain />
        <BackgroundGrid />
      </div>
    </>
  );
}

export default DashboardPage;
