import { YearlyContentManager } from "@/components/admin/yearly-content/YearlyContentManager";
import { Suspense } from "react";

export default function YearlyContentAdminPage() {
  return (
    <Suspense
      fallback={
        <p className="base-text-size text-gray-500">Loading yearly content...</p>
      }
    >
      <YearlyContentManager />
    </Suspense>
  );
}
