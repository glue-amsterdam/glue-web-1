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
import {
  getNumbersRowKey,
  groupNumbersPanelRows,
} from "@/lib/numbers/group-numbers-panel-rows";
import { hasDisplayNumberConflict } from "@/lib/numbers/hub-member-number-share";
import { useToast } from "@/hooks/use-toast";

type NumbersClientProps = DisplayNumbersPanelData & {
  targetUserId: string;
};

type FilterMode = "all" | "unassigned" | "assigned";
type Category = "all" | "participants" | "hubs";

const inputClass =
  "w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black md:max-w-sm";

const filterButtonClass = (active: boolean) =>
  `text-xs border rounded px-2 py-1 ${active ? "bg-black text-white border-black" : "border-gray-300"
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
  occupantsByNumber: Record<string, DisplayNumberOccupant[]>,
  hubMemberships: DisplayNumbersPanelData["hubMemberships"]
): number => {
  return Object.values(occupantsByNumber).filter((occupants) =>
    hasDisplayNumberConflict(occupants, hubMemberships)
  ).length;
};

export const NumbersClient = ({
  targetUserId,
  rows,
  occupantsByNumber,
  hubMemberships,
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
    const conflicts = countConflicts(occupantsByNumber, hubMemberships);

    return { assigned, unassigned, conflicts };
  }, [rows, occupantsByNumber, hubMemberships]);

  const listItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const includeMembers = category !== "hubs";
    const includeSolos = category !== "hubs";

    const matchesCategory = (row: DisplayNumberRow): boolean => {
      if (category === "participants" && row.entityType !== "participant") {
        return false;
      }

      if (category === "hubs" && row.entityType !== "hub") {
        return false;
      }

      return true;
    };

    const matchesFilterMode = (row: DisplayNumberRow): boolean => {
      if (filterMode === "assigned" && !row.displayNumber?.trim()) {
        return false;
      }

      if (filterMode === "unassigned" && row.displayNumber?.trim()) {
        return false;
      }

      return true;
    };

    const matchesSearch = (row: DisplayNumberRow): boolean => {
      if (!term) return true;

      const number = row.displayNumber?.toLowerCase() ?? "";
      const inheritedNumbers = row.inheritedHubs
        .map((hub) => hub.displayNumber?.toLowerCase() ?? "")
        .join(" ");

      return (
        row.name.toLowerCase().includes(term) ||
        number.includes(term) ||
        inheritedNumbers.includes(term) ||
        row.context.toLowerCase().includes(term)
      );
    };

    const memberFilterKeys = new Set<string>();
    const visibleKeys = new Set<string>();
    const expandHubKeys = new Set<string>();

    for (const row of rows) {
      if (!matchesCategory(row) || !matchesFilterMode(row)) {
        continue;
      }

      const key = getNumbersRowKey(row);
      memberFilterKeys.add(key);

      if (matchesSearch(row)) {
        visibleKeys.add(key);
        if (term && row.entityType === "hub") {
          expandHubKeys.add(key);
        }
      }
    }

    return groupNumbersPanelRows({
      rows,
      visibleKeys,
      memberFilterKeys,
      includeHubRows: true,
      includeMembers,
      includeSolos,
      expandHubKeys,
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

  const handleSaveHubPrefs = async (
    row: DisplayNumberRow,
    prefs: { showHubNumber: boolean }
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
          showHubNumber: prefs.showHubNumber,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to update Hub number settings");
      }

      toast({
        title: "Saved",
        description: `Hub number visibility updated for ${row.name}.`,
      });
      router.refresh();
      return true;
    } catch (error) {
      console.error("Error saving hub number prefs:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update Hub number settings.",
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
          onClick={() => {
            setCategory("all");
            setFilterMode("all");
          }}
          className={filterButtonClass(category === "all" && filterMode === "all")}
          aria-pressed={category === "all" && filterMode === "all"}
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
          onClick={() => setFilterMode("assigned")}
          className={filterButtonClass(filterMode === "assigned")}
          aria-pressed={filterMode === "assigned"}
        >
          With
        </button>
        <button
          type="button"
          onClick={() => setFilterMode("unassigned")}
          className={filterButtonClass(filterMode === "unassigned")}
          aria-pressed={filterMode === "unassigned"}
        >
          Without
        </button>
      </div>

      {listItems.length === 0 ? (
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
            {listItems.map((item) => {
              const rowKey = `${item.row.entityType}:${item.row.entityId}`;

              return (
                <NumberRowMobile
                  key={`${rowKey}:${item.parentHubId ?? "root"}:${item.mode}`}
                  item={item}
                  targetUserId={targetUserId}
                  occupantsByNumber={occupantsByNumber}
                  onSave={handleSave}
                  onSaveHubPrefs={handleSaveHubPrefs}
                  isSaving={savingKey === rowKey}
                  rowHref={getRowHref(item.row, targetUserId)}
                  contextLabel={getContextLabel(item.row)}
                  statusLabel={getStatusLabel(item.row)}
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
                {listItems.map((item) => {
                  const rowKey = `${item.row.entityType}:${item.row.entityId}`;

                  return (
                    <NumberRowDesktop
                      key={`${rowKey}:${item.parentHubId ?? "root"}:${item.mode}`}
                      item={item}
                      targetUserId={targetUserId}
                      occupantsByNumber={occupantsByNumber}
                      onSave={handleSave}
                      onSaveHubPrefs={handleSaveHubPrefs}
                      isSaving={savingKey === rowKey}
                      rowHref={getRowHref(item.row, targetUserId)}
                      contextLabel={getContextLabel(item.row)}
                      statusLabel={getStatusLabel(item.row)}
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
