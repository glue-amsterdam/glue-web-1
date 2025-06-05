"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Search, Filter, X, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
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
import type { UserInfo } from "@/schemas/userInfoSchemas";
import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import type { CombinedUserInfo } from "@/types/combined-user-info";
import UserCard from "@/app/dashboard/[userId]/users-admin/user-card";
import UserFullViewContent from "@/app/components/dashboard/moderator/user-full-view-content";
import HeaderUserFullView from "@/app/components/dashboard/moderator/header-user-full-view";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ExtendedUserInfo extends UserInfo {
  participant_slug?: string;
  participant_status?: string;
  participant_is_sticky?: boolean;
  participant_is_active?: boolean;
}

interface UsersAdminPageProps {
  users: ExtendedUserInfo[];
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
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Participant-specific filters
  const [participantStatus, setParticipantStatus] = useState<string>("all");
  const [stickyFilter, setStickyFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const router = useRouter();
  const { toast } = useToast();

  // User statistics
  const userStats = useMemo(() => {
    const stats = {
      total: users.length,
      participant: users.filter((u) => u.plan_type === "participant").length,
      member: users.filter((u) => u.plan_type === "member").length,
      free: users.filter((u) => u.plan_type === "free").length,
      active_participants: users.filter(
        (u) => u.plan_type === "participant" && u.participant_is_active === true
      ).length,
      sticky_participants: users.filter(
        (u) => u.plan_type === "participant" && u.participant_is_sticky === true
      ).length,
    };
    return stats;
  }, [users]);

  // Advanced filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      // Tab filter
      if (activeTab !== "all" && user.plan_type !== activeTab) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = user.user_name?.toLowerCase().includes(searchLower);
        const matchesEmail = user.visible_emails?.some((email) =>
          email.toLowerCase().includes(searchLower)
        );
        const matchesId = user.user_id.toLowerCase().includes(searchLower);
        const matchesSlug = user.participant_slug
          ?.toLowerCase()
          .includes(searchLower);

        if (!matchesName && !matchesEmail && !matchesId && !matchesSlug) {
          return false;
        }
      }

      // Participant-specific filters
      if (user.plan_type === "participant") {
        if (
          participantStatus !== "all" &&
          user.participant_status !== participantStatus
        ) {
          return false;
        }
        if (stickyFilter === "sticky" && user.participant_is_sticky !== true) {
          return false;
        }
        if (
          stickyFilter === "not_sticky" &&
          user.participant_is_sticky === true
        ) {
          return false;
        }
        if (activeFilter === "active" && user.participant_is_active !== true) {
          return false;
        }
        if (
          activeFilter === "inactive" &&
          user.participant_is_active === true
        ) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.user_name || "";
          bValue = b.user_name || "";
          break;
        case "status":
          aValue = a.participant_status || "";
          bValue = b.participant_status || "";
          break;
        case "plan_type":
          aValue = a.plan_type;
          bValue = b.plan_type;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    users,
    searchTerm,
    activeTab,
    participantStatus,
    stickyFilter,
    activeFilter,
    sortBy,
    sortOrder,
  ]);

  // Group by type
  const usersByType = useMemo(() => {
    return {
      all: filteredAndSortedUsers,
      participant: filteredAndSortedUsers.filter(
        (u) => u.plan_type === "participant"
      ),
      member: filteredAndSortedUsers.filter((u) => u.plan_type === "member"),
      free: filteredAndSortedUsers.filter((u) => u.plan_type === "free"),
    };
  }, [filteredAndSortedUsers]);

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
        router.refresh();
        if (response.status === 207) {
          toast({
            title: "Partial Deletion",
            description: `${result.deletedUsers.length} users deleted. ${result.failedDeletions.length} deletions failed.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `${result.deletedUsers.length} users deleted successfully.`,
          });
        }
        setSelectedUsers(new Set());
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

  const clearFilters = () => {
    setSearchTerm("");
    setParticipantStatus("all");
    setStickyFilter("all");
    setActiveFilter("all");
    setSortBy("name");
    setSortOrder("asc");
    setShowAdvancedFilters(false);
  };

  const activeFiltersCount = [
    searchTerm !== "",
    participantStatus !== "all",
    stickyFilter !== "all",
    activeFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto space-y-6 bg-white text-black px-2">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, email, ID, or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="plan_type">Sort by Type</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === "asc" ? "ASC" : "DESC"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Participant Status
                  </label>
                  <Select
                    value={participantStatus}
                    onValueChange={setParticipantStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Approved</SelectItem>
                      <SelectItem value="declined">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Sticky Status
                  </label>
                  <Select value={stickyFilter} onValueChange={setStickyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="sticky">Sticky Only</SelectItem>
                      <SelectItem value="not_sticky">Not Sticky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Active Status
                  </label>
                  <Select value={activeFilter} onValueChange={setActiveFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    <p>Active: {userStats.active_participants}</p>
                    <p>Sticky: {userStats.sticky_participants}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs by user type */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="participant">Participants</TabsTrigger>
          <TabsTrigger value="member">Members</TabsTrigger>
          <TabsTrigger value="free">Visitors</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* User list */}
          <div className="lg:col-span-1">
            {/* Multiple selection controls */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {selectedUsers.size} users selected
              </p>
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
                <AlertDialogContent className=" text-black">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the selected users and remove their data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={deleteSelectedUsers}
                    >
                      Yes, delete users
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <TabsContent value="all">
              <ScrollArea className="h-[calc(100vh-400px)]">
                {usersByType.all.map((user) => (
                  <UserCard
                    key={user.user_id}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    user={user}
                    onSelectUser={onSelectUser}
                  />
                ))}
                {usersByType.all.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="participant">
              <ScrollArea className="h-[calc(100vh-400px)]">
                {usersByType.participant.map((user) => (
                  <UserCard
                    key={user.user_id}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    user={user}
                    onSelectUser={onSelectUser}
                    showParticipantDetails={true}
                  />
                ))}
                {usersByType.participant.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No participants found
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="member">
              <ScrollArea className="h-[calc(100vh-400px)]">
                {usersByType.member.map((user) => (
                  <UserCard
                    key={user.user_id}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    user={user}
                    onSelectUser={onSelectUser}
                  />
                ))}
                {usersByType.member.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No members found
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="free">
              <ScrollArea className="h-[calc(100vh-400px)]">
                {usersByType.free.map((user) => (
                  <UserCard
                    key={user.user_id}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    user={user}
                    onSelectUser={onSelectUser}
                  />
                ))}
                {usersByType.free.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No visitors found
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </div>

          {/* User details panel */}
          <div className="lg:col-span-2">
            {selectedUserDetails ? (
              <Card>
                <HeaderUserFullView selectedUser={selectedUserDetails} />
                <UserFullViewContent selectedUser={selectedUserDetails} />
              </Card>
            ) : isLoadingDetails ? (
              <Card>
                <CardContent className="flex items-center justify-center h-[calc(100vh-400px)]">
                  <LoadingFallbackMini />
                </CardContent>
              </Card>
            ) : detailsError ? (
              <Card>
                <CardContent className="flex items-center justify-center h-[calc(100vh-400px)]">
                  <p className="text-red-500">Error loading user details</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[calc(100vh-400px)]">
                  <p className="text-gray-500">Select a user to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
