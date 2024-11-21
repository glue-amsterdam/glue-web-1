"use client";

import { HubForm } from "@/app/components/dashboard/hub/hub-form";
import { useHubs } from "@/app/context/HubProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HubValues } from "@/schemas/hubSchema";
import { useState } from "react";

interface EditHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  hub: HubValues & { hubId: string };
}

export function EditHubModal({ isOpen, onClose, hub }: EditHubModalProps) {
  const { updateHub } = useHubs();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: HubValues) => {
    console.log(data);
    setIsLoading(true);
    try {
      await updateHub(hub.hubId, data);
      onClose();
    } catch (error) {
      console.error("Failed to update hub:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] md:w-[70%] lg:w-[80%] text-black max-h-[90%] overflow-y-scroll overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit Hub</DialogTitle>
        </DialogHeader>
        <HubForm
          defaultValues={hub}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
