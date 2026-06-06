"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RouteSummary } from "@/lib/routes/get-routes-summary";
import type { RouteZoneSummary } from "@/lib/routes/get-route-zones";
import { RouteZonesPanel } from "@/app/dashboard/[userId]/routes/components/route-zones-panel";
import { useToast } from "@/hooks/use-toast";

type RoutesClientProps = {
  targetUserId: string;
  routes: RouteSummary[];
  zones: RouteZoneSummary[];
};

const inputClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black max-w-sm w-full";

export const RoutesClient = ({
  targetUserId,
  routes,
  zones,
}: RoutesClientProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return routes.filter(
      (route) =>
        route.name.toLowerCase().includes(term) ||
        route.zone?.toLowerCase().includes(term)
    );
  }, [routes, searchTerm]);

  const handleDeleteRoute = async (route: RouteSummary) => {
    if (
      !window.confirm(
        `Delete "${route.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(route.id);
    try {
      const response = await fetch(`/api/maps/routes/${route.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete route");
      }

      toast({
        title: "Success",
        description: "Route deleted successfully.",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting route:", error);
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-[30px] mini-padding pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title-text">Routes</h1>
        <Link
          href={`/dashboard/${targetUserId}/routes/new`}
          className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-black text-white"
        >
          Add route
        </Link>
      </div>

      <RouteZonesPanel zones={zones} />

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search routes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClass}
          aria-label="Search routes"
        />
      </div>

      {filteredRoutes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {routes.length === 0
            ? "No routes have been created yet."
            : "No routes match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Zone</th>
                <th className="px-3 py-2 font-medium w-20">Stops</th>
                <th className="px-3 py-2 font-medium w-36 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">{route.name}</td>
                  <td className="px-3 py-2">{route.zone ?? "—"}</td>
                  <td className="px-3 py-2">{route.stopCount}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/${targetUserId}/routes/${route.id}`}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        aria-label={`Edit ${route.name}`}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoute(route)}
                        disabled={deletingId === route.id}
                        className="text-xs border border-red-300 rounded px-2 py-1 text-red-700 disabled:opacity-50"
                        aria-label={`Delete ${route.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
