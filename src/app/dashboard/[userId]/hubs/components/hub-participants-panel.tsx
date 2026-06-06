"use client";

import { useMemo } from "react";
import { Plus, XIcon } from "lucide-react";
import type { UserInfo } from "@/schemas/userInfoSchemas";

const panelClass = "flex flex-col min-h-0 lg:h-full";
const toolbarClass =
  "mb-2 flex flex-col gap-2 sm:flex-row sm:min-h-[34px] sm:items-end sm:justify-between";
const tableWrapClass =
  "flex-1 min-h-[240px] max-h-[320px] lg:min-h-[360px] lg:max-h-[360px] overflow-auto border border-gray-200";
const tableClass = "w-full table-fixed text-sm";
const cellClass = "px-2 py-1.5 align-top";
const truncateClass = `${cellClass} truncate max-w-0`;

const getParticipantLabel = (participant: UserInfo) =>
  participant.user_name ||
  participant.visible_emails?.[0] ||
  participant.user_id;

type HubSelectedParticipantsProps = {
  userInfoList: UserInfo[];
  selectedParticipants: string[];
  hubHost: string | null;
  onRemove: (userId: string) => void;
  onSetHost: (userId: string) => void;
};

export const HubSelectedParticipants = ({
  userInfoList,
  selectedParticipants,
  hubHost,
  onRemove,
  onSetHost,
}: HubSelectedParticipantsProps) => {
  return (
    <div className={panelClass}>
      <div className={toolbarClass}>
        <p className="text-xs font-medium">
          Participants ({selectedParticipants.length})
        </p>
      </div>
      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200 text-left">
              <th className={`${cellClass} font-medium`}>Participant</th>
              <th className={`${cellClass} w-20 font-medium`}>Host</th>
              <th className={`${cellClass} w-28 font-medium`} />
            </tr>
          </thead>
          <tbody>
            {selectedParticipants.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-2 py-4 text-muted-foreground text-center"
                >
                  No participants selected
                </td>
              </tr>
            ) : (
              selectedParticipants.map((userId) => {
                const participant = userInfoList.find((u) => u.user_id === userId);
                if (!participant) return null;

                const label = getParticipantLabel(participant);
                const isHost = hubHost === userId;

                return (
                  <tr key={userId} className="border-b border-gray-100">
                    <td className={`${truncateClass} font-medium`} title={label}>
                      {label}
                    </td>
                    <td className={cellClass}>
                      {isHost ? (
                        <span className="text-xs text-muted-foreground">Host</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSetHost(userId)}
                          className="text-xs border border-gray-300 rounded px-2 py-0.5"
                          aria-label={`Set ${label} as host`}
                        >
                          Set host
                        </button>
                      )}
                    </td>
                    <td className={cellClass}>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onRemove(userId)}
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label={`Remove ${label}`}
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
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

type HubAvailableParticipantsProps = {
  userInfoList: UserInfo[];
  selectedParticipants: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAdd: (userInfo: UserInfo) => void;
};

export const HubAvailableParticipants = ({
  userInfoList,
  selectedParticipants,
  searchTerm,
  onSearchChange,
  onAdd,
}: HubAvailableParticipantsProps) => {
  const selectedIds = useMemo(
    () => new Set(selectedParticipants),
    [selectedParticipants]
  );

  const filteredUserInfoList = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return userInfoList.filter((userInfo) => {
      if (userInfo.plan_type !== "participant") return false;
      return (
        userInfo.user_name?.toLowerCase().includes(searchLower) ||
        userInfo.visible_emails?.some((email) =>
          email.toLowerCase().includes(searchLower)
        ) ||
        userInfo.user_id.toLowerCase().includes(searchLower)
      );
    });
  }, [userInfoList, searchTerm]);

  return (
    <div className={panelClass}>
      <div className={toolbarClass}>
        <p className="text-xs font-medium shrink-0">Available participants</p>
        <input
          type="text"
          placeholder="Search participant..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black w-full min-w-0 sm:max-w-md sm:ml-auto"
          aria-label="Search available participants"
        />
      </div>
      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200 text-left">
              <th className={`${cellClass} w-[38%] font-medium`}>Participant</th>
              <th className={`${cellClass} font-medium`}>ID / Email</th>
              <th className={`${cellClass} w-10 font-medium`} />
            </tr>
          </thead>
          <tbody>
            {filteredUserInfoList.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-2 py-4 text-muted-foreground text-center"
                >
                  No participants found
                </td>
              </tr>
            ) : (
              filteredUserInfoList.map((userInfo) => {
                const isSelected = selectedIds.has(userInfo.user_id);
                const label = getParticipantLabel(userInfo);
                const secondary =
                  userInfo.visible_emails?.[0] || userInfo.user_id;

                return (
                  <tr key={userInfo.id} className="border-b border-gray-100">
                    <td
                      className={`${truncateClass} font-medium`}
                      title={label}
                    >
                      {label}
                    </td>
                    <td
                      className={`${truncateClass} text-muted-foreground`}
                      title={secondary}
                    >
                      {secondary}
                    </td>
                    <td className={cellClass}>
                      <button
                        type="button"
                        onClick={() => onAdd(userInfo)}
                        disabled={isSelected}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        aria-label={`Add ${label}`}
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
