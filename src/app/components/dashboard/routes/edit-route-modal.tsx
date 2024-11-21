"use client";

import { RouteForm } from "@/app/components/dashboard/routes/route-form";
import { useRoutes } from "@/app/context/RoutesProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouteValues, RouteValuesEnhanced } from "@/schemas/mapSchema";
import { useState } from "react";

interface EditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteValuesEnhanced;
}

export function EditRouteModal({
  isOpen,
  onClose,
  route,
}: EditRouteModalProps) {
  const { updateRoute } = useRoutes();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: RouteValues) => {
    setIsLoading(true);
    try {
      await updateRoute(route.id, data);
      onClose();
    } catch (error) {
      console.error("Failed to update route:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] md:w-[70%] lg:w-[80%] text-black max-h-[90%] overflow-y-scroll overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit Route</DialogTitle>
        </DialogHeader>
        <RouteForm
          defaultValues={route}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
