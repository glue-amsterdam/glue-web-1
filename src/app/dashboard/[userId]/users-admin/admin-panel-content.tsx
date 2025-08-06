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
import type { CombinedUserInfo } from "@/types/combined-user-info";
import UserCard from "@/app/dashboard/[userId]/users-admin/user-card";
import UserFullViewContent from "@/app/components/dashboard/moderator/user-full-view-content";
import HeaderUserFullView from "@/app/components/dashboard/moderator/header-user-full-view";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface ExtendedUserInfo extends UserInfo {
  participant_slug?: string;
  participant_status?: string;
  participant_is_sticky?: boolean;
  participant_is_active?: boolean;
  participant_special_program?: boolean;
  participant_reactivation_requested?: boolean;
  participant_reactivation_status?: string | null;
  upgrade_requested?: boolean;
  upgrade_requested_plan_id?: string | null;
  upgrade_requested_plan_type?: string | null;
  upgrade_request_notes?: string | null;
  upgrade_requested_at?: string | null;
  phone_numbers?: string[] | null;
  social_media?: Record<string, unknown> | null;
  visible_websites?: string[] | null;
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

  // New filters
  const [modFilter, setModFilter] = useState<string>("all");
  const [upgradeFilter, setUpgradeFilter] = useState<string>("all");
  const [specialProgramFilter, setSpecialProgramFilter] =
    useState<string>("all");
  const [reactivationRequestedFilter, setReactivationRequestedFilter] =
    useState<string>("all");
  const [reactivationStatusFilter, setReactivationStatusFilter] =
    useState<string>("all");

  const router = useRouter();
  const { toast } = useToast();

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

      // Plan type filter (redundant with tab, but useful if you want to combine)
      // Moderator
      if (modFilter !== "all") {
        if (modFilter === "mod" && !user.is_mod) return false;
        if (modFilter === "not_mod" && user.is_mod) return false;
      }

      // Upgrade requested
      if (upgradeFilter !== "all") {
        if (upgradeFilter === "requested" && !user.upgrade_requested)
          return false;
        if (upgradeFilter === "not_requested" && user.upgrade_requested)
          return false;
      }

      // Participant: status, sticky, active, special_program, reactivation
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
        if (specialProgramFilter !== "all") {
          if (
            specialProgramFilter === "yes" &&
            !user.participant_special_program
          )
            return false;
          if (specialProgramFilter === "no" && user.participant_special_program)
            return false;
        }
        if (reactivationRequestedFilter !== "all") {
          if (
            reactivationRequestedFilter === "yes" &&
            !user.participant_reactivation_requested
          )
            return false;
          if (
            reactivationRequestedFilter === "no" &&
            user.participant_reactivation_requested
          )
            return false;
        }
        if (reactivationStatusFilter !== "all") {
          if (user.participant_reactivation_status !== reactivationStatusFilter)
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
    modFilter,
    upgradeFilter,
    specialProgramFilter,
    reactivationRequestedFilter,
    reactivationStatusFilter,
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
    setModFilter("all");
    setUpgradeFilter("all");
    setSpecialProgramFilter("all");
    setReactivationRequestedFilter("all");
    setReactivationStatusFilter("all");
  };

  const activeFiltersCount = [
    searchTerm !== "",
    participantStatus !== "all",
    stickyFilter !== "all",
    activeFilter !== "all",
    modFilter !== "all",
    upgradeFilter !== "all",
    specialProgramFilter !== "all",
    reactivationRequestedFilter !== "all",
    reactivationStatusFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-white text-black max-w-[90%] mx-auto">
      <div className="top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <Card className="shadow-none border-none bg-white">
          <CardContent className="p-4 pb-2">
            <div className="flex gap-4 items-center mb-2 flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, ID, or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dashboard-input border border-gray rounded-md"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-white text-black border border-gray rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray">
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="plan_type">Sort by Type</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="bg-white text-black border border-gray rounded-md"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === "asc" ? "ASC" : "DESC"}
              </Button>
              {/* Filtro rápido: Moderador */}
              <Select value={modFilter} onValueChange={setModFilter}>
                <SelectTrigger className="w-32 bg-white text-black border border-gray rounded-md">
                  <SelectValue placeholder="Mod" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="mod">Moderators</SelectItem>
                  <SelectItem value="not_mod">Not Mod</SelectItem>
                </SelectContent>
              </Select>
              {/* Filtro rápido: Upgrade solicitado */}
              <Select value={upgradeFilter} onValueChange={setUpgradeFilter}>
                <SelectTrigger className="w-40 bg-white text-black border border-gray rounded-md">
                  <SelectValue placeholder="Upgrade" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="requested">Upgrade Requested</SelectItem>
                  <SelectItem value="not_requested">No Upgrade</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="bg-white text-black border border-gray rounded-md"
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
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border border-gray bg-white rounded-md mt-2 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Participant Status
                    </label>
                    <Select
                      value={participantStatus}
                      onValueChange={setParticipantStatus}
                    >
                      <SelectTrigger className="bg-white text-black border border-gray rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border border-gray">
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
                    <Select
                      value={stickyFilter}
                      onValueChange={setStickyFilter}
                    >
                      <SelectTrigger className="bg-white text-black border border-gray rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border border-gray">
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
                    <Select
                      value={activeFilter}
                      onValueChange={setActiveFilter}
                    >
                      <SelectTrigger className="bg-white text-black border border-gray rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border border-gray">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Special Program
                    </label>
                    <Select
                      value={specialProgramFilter}
                      onValueChange={setSpecialProgramFilter}
                    >
                      <SelectTrigger className="bg-white text-black border border-gray rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border border-gray">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reactivation Requested
                    </label>
                    <Select
                      value={reactivationRequestedFilter}
                      onValueChange={setReactivationRequestedFilter}
                    >
                      <SelectTrigger className="bg-white text-black border border-gray rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border border-gray">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reactivation Status
                    </label>
                    <Select
                      value={reactivationStatusFilter}
                      onValueChange={setReactivationStatusFilter}
                    >
                      <SelectTrigger className="bg-white text-black border border-gray rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border border-gray">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs by user type */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="grid w-full grid-cols-4 top-[80px] z-10 bg-white border-b border-gray-200 py-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="participant">Participants</TabsTrigger>
          <TabsTrigger value="member">Members</TabsTrigger>
          <TabsTrigger value="free">Visitors</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 mt-2">
          {/* User list */}
          <div className="lg:col-span-1 flex flex-col min-h-0 bg-white rounded-md shadow-sm">
            {/* Multiple selection controls */}
            <div className="flex justify-between items-center mb-2 px-2 py-2 border-b border-gray-200">
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
                <AlertDialogContent className="text-black">
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

            {/* User list container with fixed height */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="all" className="h-full mt-0">
                <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
                  <div className="space-y-1 px-2 pb-2">
                    {usersByType.all.map((user, idx) => (
                      <div
                        key={user.user_id}
                        className={
                          idx !== usersByType.all.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }
                      >
                        <UserCard
                          selectedUsers={selectedUsers}
                          setSelectedUsers={setSelectedUsers}
                          user={user}
                          onSelectUser={onSelectUser}
                        />
                      </div>
                    ))}
                    {usersByType.all.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No users found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="participant" className="h-full mt-0">
                <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
                  <div className="space-y-1 px-2 pb-2">
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
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="member" className="h-full mt-0">
                <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
                  <div className="space-y-1 px-2 pb-2">
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
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="free" className="h-full mt-0">
                <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
                  <div className="space-y-1 px-2 pb-2">
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
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </div>

          {/* User details panel */}
          <div className="lg:col-span-2 flex flex-col min-h-0 bg-gray-50 border-l border-gray-200 p-2 rounded-md">
            {selectedUserDetails ? (
              <Card className="h-full flex flex-col bg-white shadow-sm border border-gray-200">
                <HeaderUserFullView selectedUser={selectedUserDetails} />
                <div className="flex-1 overflow-y-auto">
                  <UserFullViewContent selectedUser={selectedUserDetails} />
                </div>
              </Card>
            ) : isLoadingDetails ? (
              <Card className="h-full flex items-center justify-center bg-white shadow-sm border border-gray-200">
                <CardContent className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </CardContent>
              </Card>
            ) : detailsError ? (
              <Card className="h-full flex items-center justify-center bg-white shadow-sm border border-gray-200">
                <CardContent className="flex items-center justify-center h-full">
                  <p className="text-red-500">Error loading user details</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-white shadow-sm border border-gray-200">
                <CardContent className="flex items-center justify-center h-full">
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
