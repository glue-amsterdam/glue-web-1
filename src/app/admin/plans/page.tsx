import { getPlans } from "@/app/actions/plans";
import AdminBackHeader from "@/components/admin/AdminBackHeader";
import AdminHeader from "@/components/admin/AdminHeader";
import PlansList from "@/components/admin/plans/PlansList";

export default async function PlansPage() {
  const plans = await getPlans();

  return (
    <div className="container mx-auto p-4 pt-[6rem] pb-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <AdminHeader />
        <AdminBackHeader backLink="/admin" sectionTitle="Plans" />
        <PlansList initialPlans={plans} />
      </div>
    </div>
  );
}
