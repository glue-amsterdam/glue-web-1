"use client";

import { useMemo } from "react";
import { Plus, XIcon } from "lucide-react";
import type { MapInfoAPICall, RouteStep } from "@/schemas/mapSchema";

const panelClass = "flex flex-col min-h-0 lg:h-full";
const toolbarClass =
  "mb-2 flex flex-col gap-2 sm:flex-row sm:min-h-[34px] sm:items-end sm:justify-between";
const tableWrapClass =
  "flex-1 min-h-[240px] max-h-[320px] lg:min-h-[360px] lg:max-h-[360px] overflow-auto border border-gray-200";
const tableClass = "w-full table-fixed text-sm";
const cellClass = "px-2 py-1.5 align-top";
const truncateClass = `${cellClass} truncate max-w-0`;

type RouteSelectedLocationsProps = {
  selectedDots: RouteStep[];
  onRemove: (index: number) => void;
};

export const RouteSelectedLocations = ({
  selectedDots,
  onRemove,
}: RouteSelectedLocationsProps) => {
  return (
    <div className={panelClass}>
      <div className={toolbarClass}>
        <p className="text-xs font-medium">Stops ({selectedDots.length})</p>
      </div>
      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200 text-left">
              <th className={`${cellClass} w-10 font-medium`}>#</th>
              <th className={`${cellClass} w-[38%] font-medium`}>Participant</th>
              <th className={`${cellClass} font-medium`}>Address</th>
              <th className={`${cellClass} w-10 font-medium`} />
            </tr>
          </thead>
          <tbody>
            {selectedDots.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-2 py-4 text-muted-foreground text-center"
                >
                  No stops selected
                </td>
              </tr>
            ) : (
              selectedDots.map((dot, index) => (
                <tr key={`${dot.id}-${index}`} className="border-b border-gray-100">
                  <td className={cellClass}>{dot.route_step}</td>
                  <td className={`${truncateClass} font-medium`} title={dot.display_name || undefined}>
                    {dot.display_name || "No user name"}
                  </td>
                  <td
                    className={`${truncateClass} text-muted-foreground`}
                    title={dot.formatted_address || undefined}
                  >
                    {dot.formatted_address || "—"}
                  </td>
                  <td className={cellClass}>
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="p-1 hover:bg-gray-100 rounded"
                      aria-label={`Remove stop ${dot.route_step}`}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type RouteAvailableLocationsProps = {
  mapInfoList: MapInfoAPICall[];
  selectedDots: RouteStep[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAdd: (mapInfo: MapInfoAPICall) => void;
};

export const RouteAvailableLocations = ({
  mapInfoList,
  selectedDots,
  searchTerm,
  onSearchChange,
  onAdd,
}: RouteAvailableLocationsProps) => {
  const selectedIds = useMemo(
    () => new Set(selectedDots.map((dot) => dot.id)),
    [selectedDots]
  );

  const filteredMapInfoList = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return mapInfoList.filter((mapInfo) => {
      return (
        mapInfo.formatted_address?.toLowerCase().includes(searchLower) ||
        mapInfo.display_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [mapInfoList, searchTerm]);

  return (
    <div className={panelClass}>
      <div className={toolbarClass}>
        <p className="text-xs font-medium shrink-0">Available locations</p>
        <input
          type="text"
          placeholder="Search participant or address..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black w-full min-w-0 sm:max-w-md sm:ml-auto"
          aria-label="Search available locations"
        />
      </div>
      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200 text-left">
              <th className={`${cellClass} w-[38%] font-medium`}>Participant</th>
              <th className={`${cellClass} font-medium`}>Address</th>
              <th className={`${cellClass} w-10 font-medium`} />
            </tr>
          </thead>
          <tbody>
            {filteredMapInfoList.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-2 py-4 text-muted-foreground text-center"
                >
                  No locations found
                </td>
              </tr>
            ) : (
              filteredMapInfoList.map((mapInfo) => {
                const isSelected = selectedIds.has(mapInfo.id);
                return (
                  <tr key={mapInfo.id} className="border-b border-gray-100">
                    <td
                      className={`${truncateClass} font-medium`}
                      title={mapInfo.display_name || undefined}
                    >
                      {mapInfo.display_name || "No visible data"}
                    </td>
                    <td
                      className={`${truncateClass} text-muted-foreground`}
                      title={mapInfo.formatted_address || undefined}
                    >
                      {mapInfo.formatted_address || "No address"}
                    </td>
                    <td className={cellClass}>
                      <button
                        type="button"
                        onClick={() => onAdd(mapInfo)}
                        disabled={isSelected}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        aria-label={`Add ${mapInfo.display_name || "location"}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
