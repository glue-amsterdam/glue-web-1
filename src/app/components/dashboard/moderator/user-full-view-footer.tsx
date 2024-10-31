import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { isPaidUser } from "@/constants";
import { StatusType, UserWithPlanDetails } from "@/utils/user-types";
import React, { Dispatch, SetStateAction } from "react";

type Props = {
  selectedUser: UserWithPlanDetails;
  userStatus: StatusType | null;
  setUserStatus: Dispatch<SetStateAction<StatusType | null>>;
};

function UserFullViewFooter({
  selectedUser,
  userStatus,
  setUserStatus,
}: Props) {
  const handleStatusChange = async (status: StatusType) => {
    if (selectedUser && isPaidUser(selectedUser)) {
      try {
        // await updateUserStatus(selectedUser.userId, status);
        setUserStatus(status);
        console.log(
          `User ${selectedUser.userName} status changed to ${status}`
        );
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    }
  };

  if (isPaidUser(selectedUser))
    return (
      <CardFooter className="flex justify-between">
        {userStatus === "pending" && (
          <Button
            className="bg-uigreen hover:bg-uigreen/80 text-white"
            variant={userStatus === "pending" ? "default" : "outline"}
            onClick={() => handleStatusChange("accepted")}
          >
            Accept
          </Button>
        )}

        {userStatus === "pending" && (
          <Button
            variant={userStatus === "pending" ? "destructive" : "outline"}
            onClick={() => handleStatusChange("declined")}
          >
            Decline
          </Button>
        )}
      </CardFooter>
    );
}

export default UserFullViewFooter;
