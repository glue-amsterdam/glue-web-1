"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { RouteValues } from "@/schemas/mapSchema";
import { useRoutes } from "@/app/context/RoutesProvider";
import { EditRouteModal } from "@/app/components/dashboard/routes/edit-route-modal";

interface RouteItemProps {
  route: RouteValues & { id: string };
}

export function RouteItem({ route }: RouteItemProps) {
  const { deleteRoute } = useRoutes();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{route.name}</CardTitle>
        <CardDescription>{route.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">Locations: {route.dots.length}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
          Modify
        </Button>
        <Button variant="destructive" onClick={() => deleteRoute(route.id)}>
          Delete
        </Button>
      </CardFooter>
      <EditRouteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        route={route}
      />
    </Card>
  );
}
