"use client";

import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserInfo } from "@/schemas/userInfoSchemas";
import { Crown, UserCheck, User, Star } from "lucide-react";

interface ExtendedUserInfo extends UserInfo {
  participant_slug?: string;
  participant_status?: string;
  participant_is_sticky?: boolean;
  participant_is_active?: boolean;
  participant_special_program?: boolean;
}

interface UserCardProps {
  selectedUsers: Set<string>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  user: ExtendedUserInfo;
  onSelectUser: (userId: string) => void;
  showParticipantDetails?: boolean;
}

export default function UserCard({
  selectedUsers,
  setSelectedUsers,
  user,
  onSelectUser,
  showParticipantDetails = false,
}: UserCardProps) {
  const handleCheckboxChange = (checked: boolean) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(user.user_id);
      } else {
        newSet.delete(user.user_id);
      }
      return newSet;
    });
  };

  const getPlanIcon = () => {
    if (user.is_mod) return <Crown className="w-4 h-4 text-yellow-500" />;
    switch (user.plan_type) {
      case "participant":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case "member":
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    if (!showParticipantDetails || user.plan_type !== "participant")
      return null;
    if (user.participant_status === "accepted") {
      return (
        <span className="ml-1 px-2 py-0.5 rounded text-xs bg-green-50 text-green-500 font-semibold">
          Accepted
        </span>
      );
    }
    if (user.participant_status === "declined") {
      return (
        <span className="ml-1 px-2 py-0.5 rounded text-xs bg-red-500 text-white font-semibold">
          Rejected
        </span>
      );
    }
    if (user.participant_status === "pending") {
      return (
        <span className="ml-1 px-2 py-0.5 rounded text-xs bg-yellow-50 text-yellow-500 font-semibold">
          Pending
        </span>
      );
    }
    return null;
  };

  const isSelected = selectedUsers.has(user.user_id);

  // Badge para upgrade solicitado
  const upgradeBadge = user.upgrade_requested ? (
    <span
      className="ml-1 px-2 py-0.5 rounded text-xs bg-orange-50 text-orange-500 font-semibold"
      title="Upgrade solicitado"
    >
      Upgrade
    </span>
  ) : null;

  // Badge para special program
  const specialProgramBadge = user.participant_special_program ? (
    <span
      className="ml-1 px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-500 font-semibold"
      title="Special Program"
    >
      Special
    </span>
  ) : null;

  // Badge para inactivo
  const inactiveBadge =
    showParticipantDetails &&
    user.plan_type === "participant" &&
    user.participant_is_active === false ? (
      <span
        className="ml-1 px-2 py-0.5 rounded text-xs bg-red-500 text-white font-semibold"
        title="Inactive"
      >
        Inactive
      </span>
    ) : null;

  // Badge para moderador
  const modBadge = user.is_mod ? (
    <span
      className="ml-1 px-2 py-0.5 rounded text-xs bg-yellow-50 text-yellow-500 font-semibold"
      title="Moderator"
    >
      Mod
    </span>
  ) : null;

  // Estilo de borde/fondo para moderador
  const cardBorder = user.is_mod
    ? "border-yellow-500 bg-yellow-50"
    : isSelected
    ? "bg-blue-100 border-blue-500 shadow-sm"
    : "bg-white border-gray hover:border-gray";

  return (
    <div
      className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${cardBorder}`}
      onClick={() => onSelectUser(user.user_id)}
      tabIndex={0}
      aria-label={`User card for ${user.user_name || "Unnamed User"}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelectUser(user.user_id);
      }}
    >
      {/* Selection checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
        aria-label="Select user"
      />

      {/* Avatar */}
      <Avatar className="w-9 h-9 shrink-0">
        <AvatarFallback className="text-sm font-medium">
          {user.user_name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {getPlanIcon()}
          <span className="font-medium text-sm text-gray-900 truncate">
            {user.user_name || "Unnamed User"}
          </span>
          {user.participant_is_sticky && (
            <span title="Sticky" aria-label="Sticky">
              <Star className="w-3 h-3 text-yellow-500 shrink-0" />
            </span>
          )}
          {getStatusBadge()}
          {upgradeBadge}
          {specialProgramBadge}
          {inactiveBadge}
          {modBadge}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-xs px-1.5 py-0.5 ${
              user.plan_type === "participant"
                ? "border-green-500 text-green-500"
                : user.plan_type === "member"
                ? "border-blue-500 text-blue-500"
                : "border-gray text-uiblack"
            }`}
          >
            {user.plan_type}
          </Badge>

          {user.visible_emails?.[0] && (
            <span className="text-xs text-gray-500 truncate">
              {user.visible_emails[0]}
            </span>
          )}

          {showParticipantDetails && user.participant_slug && (
            <span className="text-xs text-gray-400 font-mono">
              /{user.participant_slug}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
