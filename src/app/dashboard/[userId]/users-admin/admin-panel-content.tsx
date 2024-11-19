"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserCard from "@/app/components/dashboard/moderator/user-card";
import HeaderUserFullView from "@/app/components/dashboard/moderator/header-user-full-view";
import UserFullViewContent from "@/app/components/dashboard/moderator/user-full-view-content";
import UserFullViewFooter from "@/app/components/dashboard/moderator/user-full-view-footer";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusType, User, UserWithPlanDetails } from "@/schemas/usersSchemas";

export default function UsersAdminPage({ users }: { users: User[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithPlanDetails | null>(
    null
  );
  const [userStatus, setUserStatus] = useState<StatusType | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || user.type === selectedType;

    return matchesSearch && matchesType;
  });

  const deleteSelectedUsers = () => {
    // API to delete the users
    console.log("Deleting users:", Array.from(selectedUsers));
    setSelectedUsers(new Set());
  };

  return (
    <div className="container mx-auto ">
      <h1 className="text-2xl font-bold mb-4">Mod Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm ">{selectedUsers.size} users selected</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedUsers.size === 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-black">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the selected users and remove their data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-white hover:text-white bg-black hover:bg-black/80">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-uired hover:bg-uired/80"
                    onClick={deleteSelectedUsers}
                  >
                    Yes, delete users
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dashboard-input"
            />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="visitor">Visitor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {filteredUsers.map((user) => (
              <div key={user.userId}>
                <UserCard
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  user={user}
                  setSelectedUser={setSelectedUser}
                  setUserStatus={setUserStatus}
                />
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="md:col-span-2">
          {selectedUser ? (
            <Card>
              <HeaderUserFullView selectedUser={selectedUser} />
              <UserFullViewContent selectedUser={selectedUser} />
              <UserFullViewFooter
                selectedUser={selectedUser}
                userStatus={userStatus}
                setUserStatus={setUserStatus}
              />
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[calc(100vh-200px)]">
                <p className="text-muted-foreground">
                  Select a user to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
