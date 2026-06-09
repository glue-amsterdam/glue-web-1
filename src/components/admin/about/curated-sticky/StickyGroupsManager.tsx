"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, X } from "lucide-react";
import { EditYearModal } from "./EditYearModal";
import type { StickyParticipantOption } from "./StickyParticipantPicker";
import type { StickyMember } from "@/types/sticky-member";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";
import {
  getStickyMemberKey,
  normalizeStickyDisplayNameKey,
  stickyMemberFromApi,
  stickyMembersToPayload,
} from "@/types/sticky-member";

type YearGroup = {
  year: number;
  group_photo_url?: string;
  members: StickyMember[];
};

const parseApiError = async (res: Response) => {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return body.error ?? `Failed to save group (${res.status})`;
};

export const StickyGroupsManager = () => {
  const { toast } = useToast();

  const [years, setYears] = useState<number[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [photoUploadState, setPhotoUploadState] = useState<UploadState | null>(
    null
  );
  const handleUploadProgress = createUploadProgressHandler(setPhotoUploadState);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [newYearInput, setNewYearInput] = useState("");
  const [showNewYearInput, setShowNewYearInput] = useState(false);

  const [currentGroup, setCurrentGroup] = useState<YearGroup | null>(null);
  const [groupExistsInDb, setGroupExistsInDb] = useState(false);
  const [groupPhotoFile, setGroupPhotoFile] = useState<File | null>(null);
  const [allParticipants, setAllParticipants] = useState<
    StickyParticipantOption[]
  >([]);

  const loadYears = useCallback(async () => {
    setIsLoadingYears(true);
    try {
      const res = await fetch("/api/admin/sticky-groups/years");
      if (res.ok) {
        const yearsData = await res.json();
        setYears(yearsData);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load years.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingYears(false);
    }
  }, [toast]);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  const loadAllParticipants = async () => {
    try {
      const res = await fetch("/api/admin/sticky-groups/participants");
      if (!res.ok) {
        const message = await parseApiError(res);
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        setAllParticipants([]);
        return;
      }

      const participantsData = await res.json();
      setAllParticipants(participantsData);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load participants.",
        variant: "destructive",
      });
      setAllParticipants([]);
    }
  };

  const handleEditYear = async (year: number) => {
    setIsLoadingGroup(true);
    setEditingYear(year);
    setCurrentGroup(null);
    setGroupExistsInDb(false);
    setGroupPhotoFile(null);
    setIsModalOpen(true);

    try {
      await loadAllParticipants();

      const res = await fetch(`/api/admin/sticky-groups/${year}`);
      if (res.ok) {
        const groupData = await res.json();
        setGroupExistsInDb(true);
        setCurrentGroup({
          year: groupData.year,
          group_photo_url: groupData.group_photo_url,
          members: (groupData.members ?? groupData.participants ?? []).map(
            stickyMemberFromApi
          ),
        });
      } else {
        setGroupExistsInDb(false);
        setCurrentGroup({
          year,
          group_photo_url: "",
          members: [],
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load group data.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGroup(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingYear(null);
    setCurrentGroup(null);
    setGroupExistsInDb(false);
    setGroupPhotoFile(null);
    setShowNewYearInput(false);
    setNewYearInput("");
  };

  const handleAddNewYear = () => {
    const year = parseInt(newYearInput, 10);
    if (year && year >= 2000 && year <= 2100) {
      setShowNewYearInput(false);
      setNewYearInput("");
      handleEditYear(year);
    } else {
      toast({
        title: "Invalid Year",
        description: "Please enter a valid year between 2000 and 2100.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupPhotoFile(file);
    }
  };

  const handleAddParticipant = (participant: StickyParticipantOption) => {
    setCurrentGroup((prev) => {
      if (!prev) return prev;

      if (
        prev.members.some(
          (member) =>
            member.kind === "user" && member.user_id === participant.user_id
        )
      ) {
        return prev;
      }

      return {
        ...prev,
        members: [
          ...prev.members,
          {
            kind: "user",
            user_id: participant.user_id,
            name: participant.name,
            slug: participant.slug,
            is_curated: true,
          },
        ],
      };
    });
  };

  const handleAddResolvedUser = (member: {
    user_id: string;
    name: string;
    slug: string;
  }) => {
    setCurrentGroup((prev) => {
      if (!prev) return prev;

      if (
        prev.members.some(
          (entry) => entry.kind === "user" && entry.user_id === member.user_id
        )
      ) {
        return prev;
      }

      return {
        ...prev,
        members: [
          ...prev.members,
          {
            kind: "user",
            user_id: member.user_id,
            name: member.name,
            slug: member.slug,
            is_curated: true,
          },
        ],
      };
    });
  };

  const handleAddDisplayName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const key = normalizeStickyDisplayNameKey(trimmed);

    setCurrentGroup((prev) => {
      if (!prev) return prev;

      if (
        prev.members.some(
          (member) => member.kind === "display_name" && member.key === key
        )
      ) {
        return prev;
      }

      return {
        ...prev,
        members: [
          ...prev.members,
          {
            kind: "display_name",
            key,
            name: trimmed,
            is_curated: true,
          },
        ],
      };
    });
  };

  const handleRemoveMember = (memberKey: string) => {
    setCurrentGroup((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        members: prev.members.filter(
          (member) => getStickyMemberKey(member) !== memberKey
        ),
      };
    });
  };

  const handleSaveGroup = async () => {
    if (!currentGroup) return;

    setIsSavingGroup(true);
    try {
      let photoUrl = currentGroup.group_photo_url;

      if (groupPhotoFile) {
        setPhotoUploadState({ stage: "deleting", progress: 10 });

        const { error: delError } = await deleteAllImagesInFolder(
          "assets",
          `sticky-group/${String(currentGroup.year)}`
        );

        if (delError) {
          toast({
            title: "Error deleting previous images",
            description:
              delError.message || "Could not delete previous images.",
            variant: "destructive",
          });
        }

        setPhotoUploadState({ stage: "compressing", progress: 20 });

        const { imageUrl, error } = await uploadStickyGroupImage({
          maxSizeMB: 1.3,
          file: groupPhotoFile,
          bucket: "assets",
          folder: `sticky-group/${String(currentGroup.year)}`,
          onProgress: handleUploadProgress,
        });

        if (error) throw new Error(error);
        photoUrl = imageUrl;
      }

      setPhotoUploadState({ stage: "saving", progress: 96 });

      const membersPayload = stickyMembersToPayload(currentGroup.members);
      const localMemberCount = membersPayload.length;

      let res: Response;

      if (groupExistsInDb) {
        res = await fetch(`/api/admin/sticky-groups/${currentGroup.year}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group_photo_url: photoUrl,
            members: membersPayload,
          }),
        });
      } else {
        res = await fetch("/api/admin/sticky-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: currentGroup.year,
            group_photo_url: photoUrl,
            members: membersPayload,
          }),
        });
      }

      if (!res.ok) {
        throw new Error(await parseApiError(res));
      }

      const saved = (await res.json()) as {
        memberCount?: number;
        participantCount?: number;
      };
      const savedMemberCount =
        saved.memberCount ?? saved.participantCount ?? localMemberCount;

      setGroupExistsInDb(true);

      if (localMemberCount > 0 && savedMemberCount === 0) {
        toast({
          title: "Warning",
          description:
            "Group saved but no members were persisted. Check the server logs.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description:
            savedMemberCount > 0
              ? `Sticky group saved with ${savedMemberCount} member${savedMemberCount === 1 ? "" : "s"}.`
              : "Sticky group saved!",
        });
      }

      await mutate("/api/admin/sticky-groups/years");
      await loadYears();
      await loadAllParticipants();
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save group.",
        variant: "destructive",
      });
    } finally {
      setPhotoUploadState(null);
      setIsSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (year: number) => {
    if (
      !confirm(`Are you sure you want to delete the group for year ${year}?`)
    ) {
      return;
    }

    setIsSavingGroup(true);
    try {
      toast({
        title: "Deleting group images",
        description: `Deleting all images for year ${year}...`,
      });

      const { error: delError } = await deleteAllImagesInFolder(
        "assets",
        `sticky-group/${String(year)}`
      );

      if (delError) {
        toast({
          title: "Error deleting images",
          description:
            delError.message || "Could not delete images for this year.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Images deleted",
          description: `All images for year ${year} deleted.`,
        });
      }

      const res = await fetch(`/api/admin/sticky-groups/${year}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete group");

      toast({
        title: "Success",
        description: "Sticky group deleted!",
      });

      await mutate("/api/admin/sticky-groups/years");
      await loadYears();

      if (editingYear === year) {
        handleCloseModal();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to delete group.",
        variant: "destructive",
      });
    } finally {
      setIsSavingGroup(false);
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Sticky Groups (by Year)</h2>
          {!showNewYearInput && (
            <Button
              onClick={() => setShowNewYearInput(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Year
            </Button>
          )}
        </div>

        {showNewYearInput && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Add New Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="2000"
                  max="2100"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  placeholder="Enter year (e.g., 2024)"
                  className="w-32"
                />
                <Button
                  onClick={handleAddNewYear}
                  size="sm"
                  disabled={
                    !newYearInput ||
                    parseInt(newYearInput) < 2000 ||
                    parseInt(newYearInput) > 2100
                  }
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setShowNewYearInput(false);
                    setNewYearInput("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {isLoadingYears ? (
            <p className="text-gray-500">Loading years...</p>
          ) : years.length === 0 ? (
            <p className="text-gray-500">No sticky groups created yet.</p>
          ) : (
            years.map((year) => (
              <Card key={year}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg">{year}</span>
                      <Badge variant="outline">Sticky Group</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditYear(year)}
                        size="sm"
                        variant="outline"
                        disabled={isLoadingGroup}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteGroup(year)}
                        size="sm"
                        variant="destructive"
                        disabled={isSavingGroup}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <EditYearModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingYear={editingYear}
        currentGroup={currentGroup}
        isLoadingGroup={isLoadingGroup}
        isSavingGroup={isSavingGroup}
        photoUploadState={photoUploadState}
        allParticipants={allParticipants}
        groupExists={groupExistsInDb}
        onPhotoUpload={handlePhotoUpload}
        onAddParticipant={handleAddParticipant}
        onAddResolvedUser={handleAddResolvedUser}
        onAddDisplayName={handleAddDisplayName}
        onRemoveMember={handleRemoveMember}
        onSaveGroup={handleSaveGroup}
        onDeleteGroup={handleDeleteGroup}
      />
    </>
  );
};

const deleteAllImagesInFolder = async (bucket: string, folder: string) => {
  const { createClient } = await import("@/utils/supabase/client");
  const storage = createClient().storage;
  const { data, error } = await storage
    .from(bucket)
    .list(folder, { limit: 100 });
  if (error) return { error };
  if (data && data.length > 0) {
    const paths = data.map(
      (file: { name: string }) => `${folder}/${file.name}`
    );
    const { error: delError } = await storage.from(bucket).remove(paths);
    if (delError) return { error: delError };
  }
  return { error: null };
};

const uploadStickyGroupImage = async ({
  maxSizeMB,
  file,
  bucket,
  folder,
  onProgress,
}: {
  maxSizeMB: number;
  file: File;
  bucket: string;
  folder: string;
  onProgress?: (progress: number) => void;
}) => {
  const { uploadImage: uploadImageUtil } = await import(
    "@/utils/supabase/storage/client"
  );
  return uploadImageUtil({ maxSizeMB, file, bucket, folder, onProgress });
};
