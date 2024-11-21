import ModifyPlansForm from "@/app/admin/components/modify-plans-form";
import { Suspense } from "react";

export default function PlanSectionsForm() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-8">
        Modify Plans
      </h1>

      <Suspense>
        <ModifyPlansForm />
      </Suspense>
    </div>
  );
}
