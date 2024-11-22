import { fetchPlans } from "@/utils/api";
import ModifyPlansForm from "@/app/admin/components/modify-plans-form";
import { usePlans } from "@/app/context/PlansProvider";

export async function PlansServer() {
  const { plans, setPlans } = usePlans();

  if (plans.length === 0) {
    const initialPlans = await fetchPlans();
    setPlans(initialPlans.plans);
  }

  return <ModifyPlansForm />;
}
