"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import HeaderUserFullView from "@/app/components/dashboard/moderator/header-user-full-view";
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
import { UserInfo } from "@/schemas/userInfoSchemas";
import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { CombinedUserInfo } from "@/types/combined-user-info";
import UserCard from "@/app/dashboard/[userId]/users-admin/user-card";
import UserFullViewContent from "@/app/components/dashboard/moderator/user-full-view-content";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface UsersAdminPageProps {
  users: UserInfo[];
  selectedUserDetails: CombinedUserInfo | undefined;
  isLoadingDetails: boolean;
  detailsError: undefined | string;
  onSelectUser: (userId: string) => void;
}

export default function UsersAdminPage({
  users,
  selectedUserDetails,
  isLoadingDetails,
  detailsError,
  onSelectUser,
}: UsersAdminPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.visible_emails?.some((email) =>
        email.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || user.plan_type === selectedType;

    return matchesSearch && matchesType;
  });

  const deleteSelectedUsers = async () => {
    setIsDeleting(true);
    const userIdsToDelete = Array.from(selectedUsers);

    try {
      const response = await fetch("/api/deleteUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: userIdsToDelete }),
      });

      const result = await response.json();

      if (response.ok) {
        if (response.status === 207) {
          // Partial success
          toast({
            title: "Partial Deletion",
            description: `${result.deletedUsers.length} users deleted. ${result.failedDeletions.length} deletions failed.`,
            variant: "destructive",
          });
        } else {
          // Full success
          toast({
            title: "Success",
            description: `${result.deletedUsers.length} users deleted successfully.`,
          });
        }
        setSelectedUsers(new Set());
        router.refresh();
      } else {
        throw new Error(result.message || "Failed to delete users");
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mod Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm">{selectedUsers.size} users selected</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedUsers.size === 0 || isDeleting}
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
              <UserCard
                key={user.user_id}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                user={user}
                onSelectUser={onSelectUser}
              />
            ))}
          </ScrollArea>
        </div>
        <div className="md:col-span-2">
          {selectedUserDetails ? (
            <Card>
              <HeaderUserFullView selectedUser={selectedUserDetails} />
              <UserFullViewContent selectedUser={selectedUserDetails} />
            </Card>
          ) : isLoadingDetails ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[calc(100vh-200px)]">
                <LoadingFallbackMini />
              </CardContent>
            </Card>
          ) : detailsError ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[calc(100vh-200px)]">
                <p className="text-muted-foreground">
                  Error loading user details
                </p>
              </CardContent>
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
