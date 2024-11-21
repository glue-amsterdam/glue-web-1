"use client";

import { HubItem } from "@/app/components/dashboard/hub/hub-item";
import { useHubs } from "@/app/context/HubProvider";

export function HubList() {
  const { hubs } = useHubs();

  return (
    <div className="space-y-4">
      {hubs.map((hub) => (
        <HubItem key={hub.hubId} hub={hub} />
      ))}
    </div>
  );
}
