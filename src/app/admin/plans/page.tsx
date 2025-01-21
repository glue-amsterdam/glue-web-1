import AdminHeader from "@/app/admin/components/admin-header";
import { getPlans } from "@/app/actions/plans";
import Link from "next/link";
import PlansList from "@/app/admin/plans/plans-list";

export default async function PlansPage() {
  const plans = await getPlans();

  return (
    <div className="container mx-auto p-4">
      <AdminHeader adminName="Admin" />
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <Link
          href="/admin"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to Admin Dashboard
        </Link>
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">
          Plan Management
        </h2>
        <PlansList initialPlans={plans} />
      </div>
    </div>
  );
}
