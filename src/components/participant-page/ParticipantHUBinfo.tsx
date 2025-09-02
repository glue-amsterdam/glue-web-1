"use client";

import Link from "next/link";

interface Hub {
  id: string;
  name: string;
  hub_host_id: string;
  mapInfoId: string | null;
  hub_address: string | null;
}

interface ParticipantHubInfoProps {
  userId: string;
  hubs: Hub[];
}

export function ParticipantHubInfo({ userId, hubs }: ParticipantHubInfoProps) {
  return (
    <>
      {hubs.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">HUBS</h2>
          {hubs.map((hub) => (
            <div key={hub.id} className="flex flex-col">
              <Link
                href={hub.mapInfoId ? `/map?place=${hub.mapInfoId}` : "#"}
                target="_blank"
                className="hover:underline flex flex-col hover:scale-95 transition-all duration-300 ease-out"
              >
                <span className="font-semibold">{hub.name}</span>
                <span className="text-sm italic mt-1">
                  {hub.hub_host_id === userId ? (
                    <span className="text-sm italic mt-1">HUB Host</span>
                  ) : (
                    hub.hub_address || "No address available"
                  )}
                </span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="sr-only">This participant is not a hub member or host</p>
      )}
    </>
  );
}
