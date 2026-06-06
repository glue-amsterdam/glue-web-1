"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { MapInfoAPICall, RouteStep } from "@/schemas/mapSchema";
import type { RouteZoneSummary } from "@/lib/routes/get-route-zones";
import {
  RouteFormFields,
  type RouteFormFieldValues,
} from "@/app/dashboard/[userId]/routes/components/route-form-fields";
import {
  RouteAvailableLocations,
  RouteSelectedLocations,
} from "@/app/dashboard/[userId]/routes/components/route-locations-panel";

type CreateRouteClientProps = {
  targetUserId: string;
  mapInfoList: MapInfoAPICall[];
  routeZones: RouteZoneSummary[];
};

export const CreateRouteClient = ({
  targetUserId,
  mapInfoList,
  routeZones,
}: CreateRouteClientProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDots, setSelectedDots] = useState<RouteStep[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formValues, setFormValues] = useState<RouteFormFieldValues>({
    name: "",
    description: "",
    route_zone_id: routeZones[0]?.id ?? "",
  });
  const { toast } = useToast();

  const addDotToRoute = (mapInfo: MapInfoAPICall) => {
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

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/maps/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          route_zone_id: formValues.route_zone_id,
          dots: selectedDots,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create route");
      }

      toast({
        title: "Success",
        description: "Route created successfully.",
      });
      router.push(`/dashboard/${targetUserId}/routes`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-[30px] mini-padding pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title-text">Create Route</h1>
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
          {isSubmitting ? "Creating..." : "Create route"}
        </button>
      </form>
    </div>
  );
};
