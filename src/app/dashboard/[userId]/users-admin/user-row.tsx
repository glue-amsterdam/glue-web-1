"use client";

import type React from "react";
import type { AdminUserDetail, AdminUserListItem } from "@/types/admin-user";
import UserDetailAccordion from "@/app/dashboard/[userId]/users-admin/user-detail-accordion";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export type UserRowProps = {
  user: AdminUserListItem;
  isExpanded: boolean;
  isSelected: boolean;
  detail?: AdminUserDetail;
  isLoadingDetail: boolean;
  detailError?: string;
  onToggleExpand: (userId: string) => void;
  onToggleSelect: (userId: string, checked: boolean) => void;
};

const statusTextClass = (status?: string): string => {
  if (status === "accepted") return "text-green-700";
  if (status === "declined") return "text-red-700";
  if (status === "pending") return "text-yellow-700";
  return "text-gray-600";
};

export const UserStatusIndicators = ({ user }: { user: AdminUserListItem }) => {
  if (user.entityType !== "participant") {
    if (user.isMod) {
      return <span className="text-yellow-700">moderator</span>;
    }

    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs md:text-sm">
      {user.participantStatus && (
        <span className={statusTextClass(user.participantStatus)}>
          {user.participantStatus}
        </span>
      )}
      {user.participantIsActive === false && (
        <span className="text-red-700">inactive</span>
      )}
      {user.participantIsSticky && (
        <span className="text-yellow-600" title="Sticky">
          sticky
        </span>
      )}
      {user.participantSpecialProgram && (
        <span className="text-purple-700">special</span>
      )}
      {user.participantReactivationRequested &&
        user.participantReactivationStatus === "pending" && (
          <span className="text-orange-700">reactivation</span>
        )}
    </div>
  );
};

const UserRowExpandPanel = ({
  isLoadingDetail,
  detailError,
  detail,
}: Pick<UserRowProps, "isLoadingDetail" | "detailError" | "detail">) => {
  return (
    <div className="bg-gray-50 px-2 py-2 md:px-3">
      {isLoadingDetail && (
        <div className="py-4 flex justify-center">
          <LoadingSpinner />
        </div>
      )}
      {detailError && !isLoadingDetail && (
        <p className="text-sm text-red-600">{detailError}</p>
      )}
      {detail && !isLoadingDetail && <UserDetailAccordion detail={detail} />}
    </div>
  );
};

export const UserRowMobile = ({
  user,
  isExpanded,
  isSelected,
  detail,
  isLoadingDetail,
  detailError,
  onToggleExpand,
  onToggleSelect,
}: UserRowProps) => {
  const handleExpandClick = () => {
    onToggleExpand(user.userId);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect(user.userId, e.target.checked);
  };

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-start gap-2 px-2 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          aria-label={`Select ${user.displayName}`}
          className="mt-1 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm wrap-break-word">
            {user.displayName}
            {user.isMod && (
              <span className="ml-2 text-xs text-yellow-700">mod</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExpandClick}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? `Collapse details for ${user.displayName}`
              : `Expand details for ${user.displayName}`
          }
          className="shrink-0 text-xs border border-gray-300 rounded px-2 py-1"
        >
          {isExpanded ? "Hide" : "Details"}
        </button>
      </div>

      {isExpanded && (
        <UserRowExpandPanel
          isLoadingDetail={isLoadingDetail}
          detailError={detailError}
          detail={detail}
        />
      )}
    </div>
  );
};

export const UserRowDesktop = ({
  user,
  isExpanded,
  isSelected,
  detail,
  isLoadingDetail,
  detailError,
  onToggleExpand,
  onToggleSelect,
}: UserRowProps) => {
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(user.userId);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect(user.userId, e.target.checked);
  };

  return (
    <>
      <tr className="border-b border-gray-100">
        <td className="px-3 py-2 w-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            aria-label={`Select ${user.displayName}`}
          />
        </td>
        <td className="px-3 py-2 font-medium">{user.displayName}</td>
        <td className="px-3 py-2 capitalize text-gray-700">{user.entityType}</td>
        <td className="px-3 py-2">
          <UserStatusIndicators user={user} />
        </td>
        <td className="px-3 py-2 text-gray-600">{user.email ?? "—"}</td>
        <td className="px-3 py-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleExpandClick}
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? `Collapse details for ${user.displayName}`
                  : `Expand details for ${user.displayName}`
              }
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              {isExpanded ? "Hide" : "Details"}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-gray-100">
          <td colSpan={6} className="p-0">
            <UserRowExpandPanel
              isLoadingDetail={isLoadingDetail}
              detailError={detailError}
              detail={detail}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default UserRowDesktop;
