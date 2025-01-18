"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import useSWR from "swr";

interface Hub {
  id: string;
  name: string;
  hub_host_id: string;
  mapInfoId: string | null;
  hub_address: string | null;
}

interface ParticipantHubInfoProps {
  userId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

export function ParticipantHubInfo({ userId }: ParticipantHubInfoProps) {
  const { data: hubs, error } = useSWR<Hub[]>(
    `/api/participant-hubs?userId=${userId}`,
    fetcher
  );

  return (
    <motion.div variants={fadeInUp} className="mt-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">
        HUBS
      </h2>
      {error && <p className="text-red-500">Error loading hub information</p>}
      {!hubs && !error ? (
        <p>Loading hub information...</p>
      ) : hubs && hubs.length > 0 ? (
        <div className="space-y-4">
          {hubs.map((hub) => (
            <div key={hub.id} className="flex flex-col">
              <Link
                href={hub.mapInfoId ? `/map?place=${hub.mapInfoId}` : "#"}
                target="_blank"
                className="hover:underline flex flex-col"
              >
                <span className="font-semibold">{hub.name}</span>
                <span className="text-sm italic text-gray-600 mt-1">
                  {hub.hub_host_id === userId ? (
                    <span className="text-sm italic text-gray-600 mt-1">
                      HUB Host
                    </span>
                  ) : (
                    hub.hub_address || "No address available"
                  )}
                </span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No hubs found</p>
      )}
    </motion.div>
  );
}
