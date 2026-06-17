"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HubSummary } from "@/lib/hubs/get-hubs-summary";
import { useToast } from "@/hooks/use-toast";

type HubsClientProps = {
  targetUserId: string;
  hubs: HubSummary[];
};

const inputClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black max-w-sm w-full";

export const HubsClient = ({ targetUserId, hubs }: HubsClientProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredHubs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return hubs.filter(
      (hub) =>
        hub.name.toLowerCase().includes(term) ||
        hub.hostName.toLowerCase().includes(term)
    );
  }, [hubs, searchTerm]);

  const handleDeleteHub = async (hub: HubSummary) => {
    if (
      !window.confirm(
        `Delete "${hub.name}"? This action cannot be undone and will remove all associated data.`
      )
    ) {
      return;
    }

    setDeletingId(hub.id);
    try {
      const response = await fetch(`/api/hubs?id=${hub.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete hub");
      }

      toast({
        title: "Success",
        description: "Hub deleted successfully.",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting hub:", error);
      toast({
        title: "Error",
        description: "Failed to delete hub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-[30px] mini-padding pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title-text">Hubs</h1>
        <Link
          href={`/dashboard/${targetUserId}/hubs/new`}
          className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-black text-white"
        >
          Add hub
        </Link>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search hubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClass}
          aria-label="Search hubs"
        />
      </div>

      {filteredHubs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {hubs.length === 0
            ? "No hubs have been created yet."
            : "No hubs match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Host</th>
                <th className="px-3 py-2 font-medium w-28">Participants</th>
                <th className="px-3 py-2 font-medium w-36 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHubs.map((hub) => (
                <tr key={hub.id} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">{hub.name}</td>
                  <td className="px-3 py-2">{hub.hostName}</td>
                  <td className="px-3 py-2">{hub.participantCount}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/${targetUserId}/hubs/${hub.id}`}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        aria-label={`Edit ${hub.name}`}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteHub(hub)}
                        disabled={deletingId === hub.id}
                        className="text-xs border border-red-300 rounded px-2 py-1 text-red-700 disabled:opacity-50"
                        aria-label={`Delete ${hub.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
