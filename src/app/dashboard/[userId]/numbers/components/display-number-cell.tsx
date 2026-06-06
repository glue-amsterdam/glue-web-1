"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { Check, Loader2, X } from "lucide-react";
import type {
  DisplayNumberOccupant,
  DisplayNumberRow,
} from "@/lib/numbers/get-display-numbers-panel-data";

type DisplayNumberCellProps = {
  row: DisplayNumberRow;
  targetUserId: string;
  occupantsByNumber: Record<string, DisplayNumberOccupant[]>;
  onSave: (
    row: DisplayNumberRow,
    displayNumber: string | null
  ) => Promise<boolean>;
  isSaving: boolean;
  layout?: "inline" | "stacked";
};

const inputClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black w-[100px]";

const normalizeInput = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const getOccupantStatusLabel = (occupant: DisplayNumberOccupant): string => {
  if (occupant.visibilityReason) {
    return occupant.visibilityReason;
  }

  if (occupant.onCurrentTourMap) {
    return "in numbers list";
  }

  if (occupant.isActive === false) {
    return "inactive";
  }

  if (occupant.status !== "accepted") {
    return occupant.status;
  }

  return "not in numbers list";
};

const mergeOccupants = (
  fromIndex: DisplayNumberOccupant[],
  fromApi: Partial<DisplayNumberOccupant>[]
): DisplayNumberOccupant[] => {
  const merged = new Map<string, DisplayNumberOccupant>();

  for (const occupant of fromApi) {
    if (!occupant.entityType || !occupant.entityId) continue;

    const isActive = occupant.isActive ?? true;
    const status = occupant.status ?? "accepted";
    const visibilityReason =
      occupant.visibilityReason ??
      (isActive === false
        ? "inactive"
        : status !== "accepted"
          ? status
          : "not in numbers list");

    merged.set(`${occupant.entityType}:${occupant.entityId}`, {
      entityType: occupant.entityType,
      entityId: occupant.entityId,
      name: occupant.name ?? "Unknown",
      displayNumber: occupant.displayNumber ?? "",
      isActive,
      status,
      onCurrentTourMap: occupant.onCurrentTourMap ?? false,
      visibilityReason,
    });
  }

  for (const occupant of fromIndex) {
    merged.set(`${occupant.entityType}:${occupant.entityId}`, occupant);
  }

  return Array.from(merged.values());
};

const getOccupantHref = (
  occupant: DisplayNumberOccupant,
  targetUserId: string
): string => {
  if (occupant.entityType === "hub") {
    return `/dashboard/${targetUserId}/hubs/${occupant.entityId}`;
  }

  return `/dashboard/${occupant.entityId}/participant-details`;
};

export const DisplayNumberCell = ({
  row,
  targetUserId,
  occupantsByNumber,
  onSave,
  isSaving,
  layout = "inline",
}: DisplayNumberCellProps) => {
  const [value, setValue] = useState(row.displayNumber ?? "");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkedValue, setCheckedValue] = useState("");
  const [blockingOccupants, setBlockingOccupants] = useState<
    DisplayNumberOccupant[]
  >([]);
  const latestValueRef = useRef("");
  const requestIdRef = useRef(0);

  const savedValue = row.displayNumber ?? "";
  const normalizedValue = normalizeInput(value);
  const normalizedSavedValue = normalizeInput(savedValue);
  const hasChanges = normalizedValue !== normalizedSavedValue;
  const canSave =
    hasChanges &&
    !isChecking &&
    !isSaving &&
    (isAvailable === true || normalizedValue === null);

  const resolveOccupants = (
    number: string,
    apiOccupants: Partial<DisplayNumberOccupant>[] = []
  ): DisplayNumberOccupant[] => {
    const fromIndex = occupantsByNumber[number] ?? [];

    return mergeOccupants(fromIndex, apiOccupants).filter(
      (occupant) =>
        !(
          occupant.entityType === row.entityType &&
          occupant.entityId === row.entityId
        )
    );
  };

  const checkAvailability = useDebouncedCallback(async (nextValue: string) => {
    const normalized = normalizeInput(nextValue);

    if (normalized === null) {
      setIsAvailable(true);
      setCheckedValue("");
      setBlockingOccupants([]);
      setIsChecking(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsChecking(true);

    try {
      const response = await fetch("/api/check-display-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayNumber: normalized,
          entityType: row.entityType,
          entityId: row.entityId,
        }),
      });

      if (
        requestId !== requestIdRef.current ||
        nextValue !== latestValueRef.current
      ) {
        return;
      }

      if (!response.ok) {
        setIsAvailable(null);
        setBlockingOccupants([]);
        return;
      }

      const data = (await response.json()) as {
        isAvailable: boolean;
        occupants?: DisplayNumberOccupant[];
      };

      setIsAvailable(data.isAvailable);
      setCheckedValue(normalized);

      if (!data.isAvailable) {
        setBlockingOccupants(
          resolveOccupants(normalized, data.occupants ?? [])
        );
      } else {
        setBlockingOccupants([]);
      }
    } catch (error) {
      if (
        requestId === requestIdRef.current &&
        nextValue === latestValueRef.current
      ) {
        console.error("Error checking display number:", error);
        setIsAvailable(null);
        setBlockingOccupants([]);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsChecking(false);
      }
    }
  }, 600);

  const handleChange = (nextValue: string) => {
    latestValueRef.current = nextValue;
    setValue(nextValue);

    if (normalizeInput(nextValue) === normalizedSavedValue) {
      checkAvailability.cancel();
      requestIdRef.current += 1;
      setIsChecking(false);
      setIsAvailable(null);
      setCheckedValue("");
      setBlockingOccupants([]);
      return;
    }

    setIsAvailable(null);
    setCheckedValue("");
    setBlockingOccupants([]);
    checkAvailability(nextValue);
  };

  const handleSave = async () => {
    const success = await onSave(row, normalizedValue);
    if (success) {
      setValue(normalizedValue ?? "");
      setIsAvailable(null);
      setCheckedValue("");
      setBlockingOccupants([]);
    }
  };

  const inputBorderClass =
    isAvailable === false
      ? "border-red-500"
      : isAvailable === true
        ? "border-green-500"
        : "border-gray-300";

  const rowLayoutClass =
    layout === "stacked"
      ? "flex flex-wrap items-center gap-2"
      : "relative inline-flex items-center gap-2";

  return (
    <div className={layout === "stacked" ? "space-y-1 w-full" : "space-y-1"}>
      <div className={rowLayoutClass}>
        <input
          type="text"
          value={value}
          maxLength={10}
          onChange={(event) => handleChange(event.target.value)}
          className={`${inputClass} ${inputBorderClass}`}
          aria-label={`Display number for ${row.name}`}
        />
        <div className="flex items-center">
          {isChecking && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {!isChecking && isAvailable === true && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          {!isChecking && isAvailable === false && (
            <X className="h-4 w-4 text-red-500" />
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
          aria-label={`Save display number for ${row.name}`}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>

      {isChecking && (
        <p className="text-xs text-gray-500">Checking availability...</p>
      )}

      {!isChecking && isAvailable === false && checkedValue && (
        <div className="text-xs text-red-600 space-y-1" role="alert">
          <p>
            The display number &quot;{checkedValue}&quot; is already in use.
          </p>
          {blockingOccupants.map((occupant) => (
            <p key={`${occupant.entityType}:${occupant.entityId}`}>
              Used by{" "}
              <Link
                href={getOccupantHref(occupant, targetUserId)}
                className="underline"
              >
                {occupant.name}
              </Link>{" "}
              ({getOccupantStatusLabel(occupant)})
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
