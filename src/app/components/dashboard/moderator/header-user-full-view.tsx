"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { isParticipantUser } from "@/constants";
import { UserWithPlanDetails } from "@/schemas/usersSchemas";
import { Edit } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  selectedUser: UserWithPlanDetails;
};

function HeaderUserFullView({ selectedUser }: Props) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            {isParticipantUser(selectedUser) &&
            selectedUser.images &&
            selectedUser.images.length > 0 ? (
              <AvatarImage
                src={selectedUser.images[0].image_url}
                alt={selectedUser.userName}
              />
            ) : null}
            <AvatarFallback>{selectedUser.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{selectedUser.userName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isParticipantUser(selectedUser)
                ? selectedUser.shortDescription
                : selectedUser.email}
            </p>
          </div>
        </div>
        <Link
          target="_blank"
          href={`/dashboard/${selectedUser.userId}/user-data`}
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
