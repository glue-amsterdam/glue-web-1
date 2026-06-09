import { Suspense } from "react";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import AboutSponsorsForm from "@/components/admin/about/sponsors/AboutSponsorsForm";

export default function SponsorsAdminPage() {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <Suspense fallback={<LoadingSpinner />}>
        <AboutSponsorsForm />
      </Suspense>
    </div>
  );
}
