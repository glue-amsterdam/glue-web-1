"use client";

import { useState } from "react";
import { MapInfoAPICall, RouteValues } from "@/schemas/mapSchema";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, RouteIcon, Edit } from "lucide-react";
import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { EditRouteModal } from "@/app/dashboard/components/edit-route-modal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export type RouteFetch = RouteValues & { id: string };

export default function RoutesPage() {
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const {
    data: routes,
    error: routesError,
    isLoading: routesLoading,
    mutate: mutateRoutes,
  } = useSWR<RouteFetch[]>("/api/maps/routes", fetcher);
  const {
    data: locations,
    error: locationsError,
    isLoading: locationsLoading,
  } = useSWR<MapInfoAPICall[]>("/api/maps", fetcher);

  if (routesLoading || locationsLoading) return <LoadingFallbackMini />;
  if (routesError || locationsError) return <div>Failed to load data</div>;
  if (!routes || !locations) return <div>No data available</div>;

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
        <Button onClick={() => setEditingRouteId("new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Route
        </Button>
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
                <p className="text-sm text-muted-foreground">
                  {route.description}
                </p>

                <Button
                  variant="outline"
                  onClick={() => setEditingRouteId(route.id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Route
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {editingRouteId && (
        <EditRouteModal
          routeId={editingRouteId}
          locations={locations}
          onClose={() => setEditingRouteId(null)}
          onSave={() => {
            mutateRoutes();
            setEditingRouteId(null);
          }}
        />
      )}
    </motion.div>
  );
}
