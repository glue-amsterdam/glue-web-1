"use client";

import { RouteItem } from "@/app/components/dashboard/routes/route-item";
import { useRoutes } from "@/app/context/RoutesProvider";

export function RouteList() {
  const { routes } = useRoutes();

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <RouteItem key={route.id} route={route} />
      ))}
    </div>
  );
}
