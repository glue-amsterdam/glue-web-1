"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { MapInfoAPICall, RouteStep } from "@/schemas/mapSchema";
import type { IndividualRoute } from "@/schemas/routeSchema";
import type { RouteZoneSummary } from "@/lib/routes/get-route-zones";
import {
  RouteFormFields,
  type RouteFormFieldValues,
} from "@/app/dashboard/[userId]/routes/components/route-form-fields";
import {
  RouteAvailableLocations,
  RouteSelectedLocations,
} from "@/app/dashboard/[userId]/routes/components/route-locations-panel";
import {
  buildHubIdByMapInfoId,
  routeDotsToSteps,
} from "@/lib/routes/route-dot-mappers";

type EditRouteFormProps = {
  route: IndividualRoute;
  targetUserId: string;
  mapInfoList: MapInfoAPICall[];
  routeZones: RouteZoneSummary[];
};

export const EditRouteForm = ({
  route,
  targetUserId,
  mapInfoList,
  routeZones,
}: EditRouteFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDots, setSelectedDots] = useState<RouteStep[]>(() =>
    routeDotsToSteps(route.route_dots, mapInfoList)
  );
  const [hubIdByMapInfoId] = useState(() => buildHubIdByMapInfoId(route));
  const [searchTerm, setSearchTerm] = useState("");
  const [formValues, setFormValues] = useState<RouteFormFieldValues>({
    name: route.name,
    description: route.description,
    route_zone_id: route.route_zone_id ?? routeZones[0]?.id ?? "",
  });

  const addDotToRoute = (mapInfo: MapInfoAPICall) => {
    if (selectedDots.some((dot) => dot.id === mapInfo.id)) return;
    setSelectedDots((prev) => [
      ...prev,
      { ...mapInfo, route_step: prev.length + 1 },
    ]);
  };

  const removeDotFromRoute = (index: number) => {
    setSelectedDots((prev) => {
      const newDots = prev.filter((_, i) => i !== index);
      return newDots.map((dot, i) => ({ ...dot, route_step: i + 1 }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.name.trim()) {
      toast({
        title: "Error",
        description: "Route name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formValues.route_zone_id) {
      toast({
        title: "Error",
        description: "Please select a zone.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDots.length < 2) {
      toast({
        title: "Error",
        description: "At least two locations must be selected for the route.",
        variant: "destructive",
      });
      return;
    }

    const validRouteDots = selectedDots.filter((dot) => dot.id);
    if (validRouteDots.length !== selectedDots.length) {
      toast({
        title: "Error",
        description:
          "Some route stops are missing map information. Please remove and re-add them.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/maps/routes/${route.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          route_zone_id: formValues.route_zone_id,
          route_dots: validRouteDots.map((dot, index) => ({
            map_info_id: dot.id,
            user_id: dot.user_id,
            hub_id: hubIdByMapInfoId.get(dot.id) ?? null,
            route_step: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update route");
      }

      toast({
        title: "Success",
        description: "Route updated successfully.",
      });

      router.push(`/dashboard/${targetUserId}/routes`);
    } catch (error) {
      console.error("Error updating route:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-[30px] mini-padding pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title-text">Edit Route</h1>
        <Link
          href={`/dashboard/${targetUserId}/routes`}
          className="text-sm border border-gray-300 rounded px-3 py-1.5"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl">
        <RouteFormFields
          values={formValues}
          zones={routeZones}
          onChange={setFormValues}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 mb-6 lg:items-stretch">
          <RouteSelectedLocations
            selectedDots={selectedDots}
            onRemove={removeDotFromRoute}
          />
          <RouteAvailableLocations
            mapInfoList={mapInfoList}
            selectedDots={selectedDots}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={addDotToRoute}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="text-sm border border-gray-300 rounded px-4 py-2 bg-black text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};
