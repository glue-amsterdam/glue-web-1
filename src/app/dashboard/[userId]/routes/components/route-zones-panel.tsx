"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RouteZoneSummary } from "@/lib/routes/get-route-zones";
import { useToast } from "@/hooks/use-toast";

type RouteZonesPanelProps = {
  zones: RouteZoneSummary[];
};

const inputClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black w-full";

export const RouteZonesPanel = ({ zones }: RouteZonesPanelProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [newZoneName, setNewZoneName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddZone = async () => {
    const name = newZoneName.trim();
    if (!name) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/maps/route-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create zone");
      }

      setNewZoneName("");
      toast({ title: "Zone created" });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create zone",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (zone: RouteZoneSummary) => {
    setEditingId(zone.id);
    setEditingName(zone.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (zoneId: string) => {
    const name = editingName.trim();
    if (!name) return;

    setSavingId(zoneId);
    try {
      const response = await fetch(`/api/maps/route-zones/${zoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update zone");
      }

      setEditingId(null);
      setEditingName("");
      toast({ title: "Zone updated" });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update zone",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteZone = async (zone: RouteZoneSummary) => {
    const message =
      zone.routeCount > 0
        ? `Delete "${zone.name}"? ${zone.routeCount} route(s) will be left without a zone.`
        : `Delete "${zone.name}"?`;

    if (!window.confirm(message)) return;

    setDeletingId(zone.id);
    try {
      const response = await fetch(`/api/maps/route-zones/${zone.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete zone");
      }

      const data = await response.json();
      toast({
        title: "Zone deleted",
        description:
          data.unassignedRouteCount > 0
            ? `${data.unassignedRouteCount} route(s) unassigned.`
            : undefined,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete zone",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold mb-2">Route Zones</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          value={newZoneName}
          onChange={(e) => setNewZoneName(e.target.value)}
          placeholder="New zone name"
          className={`${inputClass} max-w-xs`}
          aria-label="New zone name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddZone();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddZone}
          disabled={isAdding || !newZoneName.trim()}
          className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-black text-white disabled:opacity-50"
        >
          {isAdding ? "Adding..." : "Add zone"}
        </button>
      </div>

      {zones.length === 0 ? (
        <p className="text-sm text-muted-foreground">No zones yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium w-24">Routes</th>
                <th className="px-3 py-2 font-medium w-40 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id} className="border-b border-gray-100">
                  <td className="px-3 py-2">
                    {editingId === zone.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className={inputClass}
                        aria-label={`Edit ${zone.name}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveEdit(zone.id);
                          }
                          if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                      />
                    ) : (
                      zone.name
                    )}
                  </td>
                  <td className="px-3 py-2">{zone.routeCount}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      {editingId === zone.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(zone.id)}
                            disabled={savingId === zone.id || !editingName.trim()}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-black text-white disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(zone)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            aria-label={`Edit ${zone.name}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteZone(zone)}
                            disabled={deletingId === zone.id}
                            className="text-xs border border-red-300 rounded px-2 py-1 text-red-700 disabled:opacity-50"
                            aria-label={`Delete ${zone.name}`}
                          >
                            Delete
                          </button>
                        </>
                      )}
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
