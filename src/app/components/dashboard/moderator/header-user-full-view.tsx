"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserInfo } from "@/schemas/userInfoSchemas";
import { Edit, Crown, UserCheck, User, Mail, MailX } from "lucide-react";
import Link from "next/link";

type Props = {
  selectedUser: UserInfo;
};

function HeaderUserFullView({ selectedUser }: Props) {
  const userInitial = selectedUser.user_name
    ? selectedUser.user_name.charAt(0).toUpperCase()
    : "U";
  const displayName = selectedUser.user_name || "Unnamed User";
  const hasEmail =
    selectedUser.visible_emails && selectedUser.visible_emails.length > 0;

  const getPlanIcon = () => {
    if (selectedUser.is_mod)
      return <Crown className="w-4 h-4 text-yellow-500" />;
    switch (selectedUser.plan_type) {
      case "participant":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case "member":
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPlanColor = () => {
    switch (selectedUser.plan_type) {
      case "participant":
        return "bg-green-100 text-green-800 border-green-200";
      case "member":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "free":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <CardHeader className="pb-2 sticky top-0 z-20 bg-gray-50 border-b border-gray bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Avatar className="w-12 h-12 shrink-0">
            <AvatarFallback className="text-lg font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getPlanIcon()}
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {displayName}
              </h2>
              {selectedUser.is_mod && (
                <Badge variant="secondary" className="text-xs">
                  MOD
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Badge className={`text-xs ${getPlanColor()}`}>
                {selectedUser.plan_type}
              </Badge>
              <span className="text-xs text-gray-500 font-mono">
                ID: {selectedUser.user_id.slice(0, 8)}...
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasEmail ? (
                <>
                  <Mail className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {selectedUser.visible_emails?.[0]}
                  </span>
                </>
              ) : (
                <>
                  <MailX className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-500">
                    No email provided
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Link
          target="_blank"
          href={`/dashboard/${selectedUser.user_id}/user-data`}
          className="shrink-0"
        >
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </Link>
      </div>
    </CardHeader>
  );
}

export default HeaderUserFullView;
