import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { isPaidUser } from "@/constants";
import { StatusType, User, UserWithPlanDetails } from "@/schemas/usersSchemas";
import { fetchUser } from "@/utils/api";
import React, { Dispatch, SetStateAction } from "react";

type Props = {
  user: User;
  setSelectedUser: Dispatch<SetStateAction<UserWithPlanDetails | null>>;
  setUserStatus: Dispatch<SetStateAction<StatusType | null>>;
  setSelectedUsers: Dispatch<SetStateAction<Set<string>>>;
  selectedUsers: Set<string>;
};

function UserCard({
  user,
  setSelectedUser,
  setUserStatus,
  setSelectedUsers,
  selectedUsers,
}: Props) {
  const toggleUserSelection = (user_id: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(user_id)) {
        newSet.delete(user_id);
      } else {
        newSet.add(user_id);
      }
      return newSet;
    });
  };

  const handleUserClick = async (id: string) => {
    try {
      const user = await fetchUser(id);
      setSelectedUser(user);
      setUserStatus(isPaidUser(user) ? user.status : null);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  return (
    <Card
      className="mb-2 cursor-pointer hover:bg-gray transition-all duration-300 group select-none flex justify-start items-start gap-2 p-2"
      onClick={() => handleUserClick(user.user_id)}
    >
      <Checkbox
        id={`select-${user.user_id}`}
        checked={selectedUsers.has(user.user_id)}
        onCheckedChange={() => toggleUserSelection(user.user_id)}
      />
      <div>
        <CardHeader className="px-2 py-1">
          <CardTitle className="group-hover:underline">
            {user.user_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-1">
          <p>{user.email}</p>
          <Badge className="uppercase text-uiwhite border border-uiblack">
            {user.type}
          </Badge>
          {isPaidUser(user) && (
            <Badge
              variant="outline"
              className={`${
                user.status == "accepted" ? "bg-uigreen" : "bg-orange-500"
              } ml-2 uppercase text-uiwhite border border-uiblack`}
            >
              {user.status}
            </Badge>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

export default UserCard;
