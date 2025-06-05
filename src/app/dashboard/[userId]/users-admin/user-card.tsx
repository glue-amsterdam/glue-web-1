"use client";

import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserInfo } from "@/schemas/userInfoSchemas";
import {
  Crown,
  UserCheck,
  User,
  Star,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface ExtendedUserInfo extends UserInfo {
  participant_slug?: string;
  participant_status?: string;
  participant_is_sticky?: boolean;
  participant_is_active?: boolean;
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

    if (user.participant_status === "approved") {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    if (user.participant_status === "rejected") {
      return <XCircle className="w-3 h-3 text-red-500" />;
    }
    if (user.participant_status === "pending") {
      return <Clock className="w-3 h-3 text-yellow-500" />;
    }
    return null;
  };

  const isSelected = selectedUsers.has(user.user_id);

  return (
    <div
      className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
        isSelected
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-white border-gray-100 hover:border-gray-200"
      }`}
      onClick={() => onSelectUser(user.user_id)}
    >
      {/* Selection checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />

      {/* Avatar */}
      <Avatar className="w-9 h-9 shrink-0">
        <AvatarFallback className="text-sm font-medium">
          {user.user_name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {getPlanIcon()}
          <span className="font-medium text-sm text-gray-900 truncate">
            {user.user_name || "Unnamed User"}
          </span>
          {user.participant_is_sticky && (
            <Star className="w-3 h-3 text-yellow-500 shrink-0" />
          )}
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
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

        {/* Inactive badge for participants */}
        {showParticipantDetails &&
          user.plan_type === "participant" &&
          user.participant_is_active === false && (
            <Badge variant="destructive" className="text-xs mt-1">
              Inactive
            </Badge>
          )}
      </div>
    </div>
  );
}
