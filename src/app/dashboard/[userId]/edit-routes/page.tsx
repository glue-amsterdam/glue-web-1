"use client";

import { useState } from "react";
import type { MapInfoAPICall, RouteValues } from "@/schemas/mapSchema";
import { motion } from "framer-motion";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RouteIcon, Trash2 } from "lucide-react";
import { EditRouteModal } from "@/app/dashboard/components/edit-route-modal";
import type { IndividualRoute } from "@/schemas/routeSchema";
import { useToast } from "@/hooks/use-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export type RouteFetch = RouteValues & { id: string };

export default function RoutesPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: routes, error: routesError } = useSWR<RouteFetch[]>(
    "/api/maps/routes",
    fetcher
  );
  const { data: mapInfoList, error: mapInfoError } = useSWR<MapInfoAPICall[]>(
    "/api/maps",
    fetcher
  );
  const { data: editingRoute, error: editingRouteError } =
    useSWR<IndividualRoute>(
      editingRouteId ? `/api/maps/routes/${editingRouteId}` : null,
      fetcher
    );

  if (routesError || mapInfoError) return <div>Failed to load data</div>;
  if (!routes || !mapInfoList) return <div>Loading...</div>;

  const handleEditRoute = (routeId: string) => {
    setEditingRouteId(routeId);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingRouteId(null);
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        const response = await fetch(`/api/maps/routes/${routeId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete route");
        }

        await mutate("/api/maps/routes");
        toast({
          title: "Success",
          description: "Route deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete route. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <motion.div
      className="container mx-auto py-10 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <RouteIcon className="h-8 w-8" />
          Routes
        </h1>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <Card key={route.id}>
              <CardHeader>
                <CardTitle>{route.name}</CardTitle>
                <CardDescription>Zone: {route.zone}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {route.description}
                </p>
                <div className="flex justify-between">
                  <Button onClick={() => handleEditRoute(route.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteRoute(route.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {editingRoute && !editingRouteError && (
        <EditRouteModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          route={editingRoute}
          mapInfoList={mapInfoList}
        />
      )}
    </motion.div>
  );
}
