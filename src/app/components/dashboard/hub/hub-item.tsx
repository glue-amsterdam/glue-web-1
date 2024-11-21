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
import { HubValues } from "@/schemas/hubSchema";
import { useHubs } from "@/app/context/HubProvider";
import { EditHubModal } from "@/app/components/dashboard/hub/edit-hub-modal";

interface HubItemProps {
  hub: HubValues & { hubId: string };
}

export function HubItem({ hub }: HubItemProps) {
  const { deleteHub } = useHubs();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hub.name}</CardTitle>
        <CardDescription>{hub.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Members: {hub.hubMembers.length}
        </p>
        <p className="text-sm text-gray-500">
          Location: {hub.hubPlace.place_name}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
          Modify
        </Button>
        <Button variant="destructive" onClick={() => deleteHub(hub.hubId)}>
          Delete
        </Button>
      </CardFooter>
      <EditHubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        hub={hub}
      />
    </Card>
  );
}
