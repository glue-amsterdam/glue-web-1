import { PlansProvider } from "@/app/context/PlansProvider";

export default function PlanSectionsForm() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-8">
        Modify Plans
      </h1>
      <PlansProvider>
        <div>Plans!</div>
      </PlansProvider>
    </div>
  );
}
