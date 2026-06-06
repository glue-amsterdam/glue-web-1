"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  NumberRowDesktop,
  NumberRowMobile,
} from "@/app/dashboard/[userId]/numbers/components/number-row";
import type {
  DisplayNumberOccupant,
  DisplayNumberRow,
  DisplayNumbersPanelData,
} from "@/lib/numbers/get-display-numbers-panel-data";
import { useToast } from "@/hooks/use-toast";

type NumbersClientProps = DisplayNumbersPanelData & {
  targetUserId: string;
};

type FilterMode = "all" | "unassigned";
type Category = "all" | "participants" | "hubs";

const inputClass =
  "w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black md:max-w-sm";

const filterButtonClass = (active: boolean) =>
  `text-xs border rounded px-2 py-1 ${
    active ? "bg-black text-white border-black" : "border-gray-300"
  }`;

const getRowHref = (row: DisplayNumberRow, targetUserId: string): string => {
  if (row.entityType === "hub") {
    return `/dashboard/${targetUserId}/hubs/${row.entityId}`;
  }

  return `/dashboard/${row.entityId}/participant-details`;
};

const getContextLabel = (row: DisplayNumberRow): string => {
  switch (row.context) {
    case "hub":
      return "Hub";
    case "hub-host":
      return "Hub host";
    case "hub-member":
      return "Hub member";
    case "solo":
      return "Solo";
    default:
      return row.context;
  }
};

const getStatusLabel = (row: DisplayNumberRow): string => {
  if (row.context === "hub") {
    return "Hub entity";
  }

  return "Active";
};

const countConflicts = (
  occupantsByNumber: Record<string, DisplayNumberOccupant[]>
): number => {
  return Object.values(occupantsByNumber).filter(
    (occupants) => occupants.length > 1
  ).length;
};

export const NumbersClient = ({
  targetUserId,
  rows,
  occupantsByNumber,
}: NumbersClientProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const stats = useMemo(() => {
    const assigned = rows.filter((row) => row.displayNumber?.trim()).length;
    const unassigned = rows.length - assigned;
    const conflicts = countConflicts(occupantsByNumber);

    return { assigned, unassigned, conflicts };
  }, [rows, occupantsByNumber]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      if (category === "participants" && row.entityType !== "participant") {
        return false;
      }

      if (category === "hubs" && row.entityType !== "hub") {
        return false;
      }

      if (filterMode === "unassigned" && row.displayNumber?.trim()) {
        return false;
      }

      if (!term) return true;

      const number = row.displayNumber?.toLowerCase() ?? "";
      return (
        row.name.toLowerCase().includes(term) ||
        number.includes(term) ||
        row.context.toLowerCase().includes(term)
      );
    });
  }, [rows, searchTerm, category, filterMode]);

  const handleSave = async (
    row: DisplayNumberRow,
    displayNumber: string | null
  ): Promise<boolean> => {
    const rowKey = `${row.entityType}:${row.entityId}`;
    setSavingKey(rowKey);

    try {
      const response = await fetch("/api/display-numbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: row.entityType,
          entityId: row.entityId,
          displayNumber,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to update display number");
      }

      toast({
        title: "Saved",
        description: `Display number updated for ${row.name}.`,
      });
      router.refresh();
      return true;
    } catch (error) {
      console.error("Error saving display number:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update display number.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="px-4 md:px-[30px] mini-padding pb-8 min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title-text">Numbers</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{stats.assigned} assigned</span>
        <span>{stats.unassigned} without number</span>
        <span>{stats.conflicts} conflicts</span>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by name or number..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className={inputClass}
          aria-label="Search numbers"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={filterButtonClass(category === "all")}
          aria-pressed={category === "all"}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setCategory("participants")}
          className={filterButtonClass(category === "participants")}
          aria-pressed={category === "participants"}
        >
          Participants
        </button>
        <button
          type="button"
          onClick={() => setCategory("hubs")}
          className={filterButtonClass(category === "hubs")}
          aria-pressed={category === "hubs"}
        >
          Hubs
        </button>
        <button
          type="button"
          onClick={() => setFilterMode("all")}
          className={filterButtonClass(filterMode === "all")}
          aria-pressed={filterMode === "all"}
        >
          All numbers
        </button>
        <button
          type="button"
          onClick={() => setFilterMode("unassigned")}
          className={filterButtonClass(filterMode === "unassigned")}
          aria-pressed={filterMode === "unassigned"}
        >
          Without number
        </button>
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {rows.length === 0
            ? "No active participants or hubs found."
            : "No entities match your filters."}
        </p>
      ) : (
        <>
          <div className="md:hidden border border-gray-200 min-w-0">
            <div className="border-b border-gray-200 bg-gray-50 px-2 py-2 text-sm font-medium">
              Name · Number
            </div>
            {filteredRows.map((row) => {
              const rowKey = `${row.entityType}:${row.entityId}`;

              return (
                <NumberRowMobile
                  key={rowKey}
                  row={row}
                  targetUserId={targetUserId}
                  occupantsByNumber={occupantsByNumber}
                  onSave={handleSave}
                  isSaving={savingKey === rowKey}
                  rowHref={getRowHref(row, targetUserId)}
                  contextLabel={getContextLabel(row)}
                  statusLabel={getStatusLabel(row)}
                />
              );
            })}
          </div>

          <div className="hidden md:block border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-3 py-2 font-medium">Number</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium w-24 text-right">
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const rowKey = `${row.entityType}:${row.entityId}`;

                  return (
                    <NumberRowDesktop
                      key={rowKey}
                      row={row}
                      targetUserId={targetUserId}
                      occupantsByNumber={occupantsByNumber}
                      onSave={handleSave}
                      isSaving={savingKey === rowKey}
                      rowHref={getRowHref(row, targetUserId)}
                      contextLabel={getContextLabel(row)}
                      statusLabel={getStatusLabel(row)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
