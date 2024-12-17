"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { UserInfo } from "@/schemas/userInfoSchemas";
import { Edit } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  selectedUser: UserInfo;
};

function HeaderUserFullView({ selectedUser }: Props) {
  const userInitial = selectedUser.user_name
    ? selectedUser.user_name.charAt(0).toUpperCase()
    : "U";

  const displayName = selectedUser.user_name || "Unnamed User";
  const displayEmail =
    selectedUser.visible_emails && selectedUser.visible_emails.length > 0
      ? selectedUser.visible_emails[0]
      : "No email provided";

  return (
    <CardHeader>
      <div className="flex items-center flex-wrap justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
          </div>
        </div>
        <Link
          target="_blank"
          href={`/dashboard/${selectedUser.user_id}/user-data`}
        >
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit User
          </Button>
        </Link>
      </div>
    </CardHeader>
  );
}

export default HeaderUserFullView;
