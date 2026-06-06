"use client";

import Link from "next/link";
import { DisplayNumberCell } from "@/app/dashboard/[userId]/numbers/components/display-number-cell";
import type {
  DisplayNumberOccupant,
  DisplayNumberRow,
} from "@/lib/numbers/get-display-numbers-panel-data";

export type NumberRowProps = {
  row: DisplayNumberRow;
  targetUserId: string;
  occupantsByNumber: Record<string, DisplayNumberOccupant[]>;
  onSave: (
    row: DisplayNumberRow,
    displayNumber: string | null
  ) => Promise<boolean>;
  isSaving: boolean;
  rowHref: string;
  contextLabel: string;
  statusLabel: string;
};

export const NumberRowMobile = ({
  row,
  targetUserId,
  occupantsByNumber,
  onSave,
  isSaving,
  rowHref,
  contextLabel,
  statusLabel,
}: NumberRowProps) => {
  const rowKey = `${row.entityType}:${row.entityId}`;

  return (
    <div className="border-b border-gray-100 px-2 py-2">
      <div className="mb-2 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm wrap-break-word">{row.name}</p>
          <p className="mt-0.5 text-xs text-gray-600">
            <span className="text-gray-700">{contextLabel}</span>
            <span className="mx-1">·</span>
            <span className="text-green-700">{statusLabel}</span>
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
      <DisplayNumberCell
        key={`${rowKey}:${row.displayNumber ?? ""}`}
        row={row}
        targetUserId={targetUserId}
        occupantsByNumber={occupantsByNumber}
        onSave={onSave}
        isSaving={isSaving}
        layout="stacked"
      />
    </div>
  );
};

export const NumberRowDesktop = ({
  row,
  targetUserId,
  occupantsByNumber,
  onSave,
  isSaving,
  rowHref,
  contextLabel,
  statusLabel,
}: NumberRowProps) => {
  const rowKey = `${row.entityType}:${row.entityId}`;

  return (
    <tr className="border-b border-gray-100 align-top">
      <td className="px-3 py-2">
        <DisplayNumberCell
          key={`${rowKey}:${row.displayNumber ?? ""}`}
          row={row}
          targetUserId={targetUserId}
          occupantsByNumber={occupantsByNumber}
          onSave={onSave}
          isSaving={isSaving}
        />
      </td>
      <td className="px-3 py-2">{contextLabel}</td>
      <td className="px-3 py-2 font-medium">{row.name}</td>
      <td className="px-3 py-2">{statusLabel}</td>
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
