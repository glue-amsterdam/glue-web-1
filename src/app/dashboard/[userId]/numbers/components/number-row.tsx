"use client";

import Link from "next/link";
import { DisplayNumberCell } from "@/app/dashboard/[userId]/numbers/components/display-number-cell";
import DisplayNumberCluster from "@/components/display-number-cluster";
import type {
  DisplayNumberOccupant,
  DisplayNumberRow,
} from "@/lib/numbers/get-display-numbers-panel-data";
import {
  getNumbersRowPreviewBadges,
  type NumbersPanelListItem,
} from "@/lib/numbers/group-numbers-panel-rows";

export type NumberRowProps = {
  item: NumbersPanelListItem;
  targetUserId: string;
  occupantsByNumber: Record<string, DisplayNumberOccupant[]>;
  onSave: (
    row: DisplayNumberRow,
    displayNumber: string | null
  ) => Promise<boolean>;
  onSaveHubPrefs?: (
    row: DisplayNumberRow,
    prefs: { showHubNumber: boolean }
  ) => Promise<boolean>;
  isSaving: boolean;
  rowHref: string;
  contextLabel: string;
  statusLabel: string;
};

const NumberPreview = ({ row }: { row: DisplayNumberRow }) => (
  <DisplayNumberCluster
    badges={getNumbersRowPreviewBadges(row)}
    fallbackType={row.type || (row.entityType === "hub" ? "hub" : "standard")}
    size="sm"
  />
);

export const NumberRowMobile = ({
  item,
  targetUserId,
  occupantsByNumber,
  onSave,
  onSaveHubPrefs,
  isSaving,
  rowHref,
  contextLabel,
  statusLabel,
}: NumberRowProps) => {
  const { row, nestLevel, mode } = item;
  const rowKey = `${row.entityType}:${row.entityId}`;
  const isHubGroup = row.entityType === "hub";

  return (
    <div
      className={`border-b border-gray-100 px-2 py-2 ${
        isHubGroup ? "bg-gray-50" : ""
      } ${nestLevel === 1 ? "pl-6" : ""}`}
    >
      <div className="mb-2 flex items-start gap-2">
        <NumberPreview row={row} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm wrap-break-word">{row.name}</p>
          <p className="mt-0.5 text-xs text-gray-600">
            <span className="text-gray-700">{contextLabel}</span>
            {mode === "edit" ? (
              <>
                <span className="mx-1">·</span>
                <span className="text-green-700">{statusLabel}</span>
              </>
            ) : null}
          </p>
        </div>
        <Link
          href={rowHref}
          className="shrink-0 text-xs border border-gray-300 rounded px-2 py-1"
          aria-label={`Open profile for ${row.name}`}
        >
          Open
        </Link>
      </div>
      {mode === "edit" ? (
        <DisplayNumberCell
          key={`${rowKey}:${row.displayNumber ?? ""}:${row.showHubNumber}`}
          row={row}
          targetUserId={targetUserId}
          occupantsByNumber={occupantsByNumber}
          onSave={onSave}
          onSaveHubPrefs={onSaveHubPrefs}
          isSaving={isSaving}
          layout="stacked"
        />
      ) : null}
    </div>
  );
};

export const NumberRowDesktop = ({
  item,
  targetUserId,
  occupantsByNumber,
  onSave,
  onSaveHubPrefs,
  isSaving,
  rowHref,
  contextLabel,
  statusLabel,
}: NumberRowProps) => {
  const { row, nestLevel, mode } = item;
  const rowKey = `${row.entityType}:${row.entityId}`;
  const isHubGroup = row.entityType === "hub";

  return (
    <tr
      className={`border-b border-gray-100 align-middle ${
        isHubGroup ? "bg-gray-50" : ""
      }`}
    >
      <td className={nestLevel === 1 ? "py-2 pr-3 pl-8" : "px-3 py-2"}>
        <div className="flex items-start gap-2">
          <NumberPreview row={row} />
          {mode === "edit" ? (
            <DisplayNumberCell
              key={`${rowKey}:${row.displayNumber ?? ""}:${row.showHubNumber}`}
              row={row}
              targetUserId={targetUserId}
              occupantsByNumber={occupantsByNumber}
              onSave={onSave}
              onSaveHubPrefs={onSaveHubPrefs}
              isSaving={isSaving}
            />
          ) : null}
        </div>
      </td>
      <td className="px-3 py-2">{contextLabel}</td>
      <td className="px-3 py-2 font-medium">{row.name}</td>
      <td className="px-3 py-2">{mode === "edit" ? statusLabel : ""}</td>
      <td className="px-3 py-2 text-right">
        <Link
          href={rowHref}
          className="text-xs border border-gray-300 rounded px-2 py-1"
          aria-label={`Open profile for ${row.name}`}
        >
          Open
        </Link>
      </td>
    </tr>
  );
};
