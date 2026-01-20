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

// --- Types ---
type Participant = {
  user_id: string;
  name: string;
  slug: string;
};

type GroupParticipant = {
  user_id: string;
  name: string;
  slug: string;
  is_curated: boolean;
};

type YearGroup = {
  year: number;
  group_photo_url?: string;
  participants: GroupParticipant[];
};

export const StickyGroupsManager = () => {
  const { toast } = useToast();

  // State
  const [years, setYears] = useState<number[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [newYearInput, setNewYearInput] = useState("");
  const [showNewYearInput, setShowNewYearInput] = useState(false);

  // Current group data
  const [currentGroup, setCurrentGroup] = useState<YearGroup | null>(null);
  const [groupPhotoFile, setGroupPhotoFile] = useState<File | null>(null);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);

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

  // Load years on component mount
  useEffect(() => {
    loadYears();
  }, [loadYears]);

  const loadAllParticipants = async () => {
    try {
      const res = await fetch("/api/admin/sticky-groups/participants");
      if (res.ok) {
        const participantsData = await res.json();
        setAllParticipants(participantsData);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load participants.",
        variant: "destructive",
      });
    }
  };

  const handleEditYear = async (year: number) => {
    setIsLoadingGroup(true);
    setEditingYear(year);
    setCurrentGroup(null);
    setGroupPhotoFile(null);
    setIsModalOpen(true);

    try {
      // Load all participants first
      await loadAllParticipants();

      // Try to load existing group data
      const res = await fetch(`/api/admin/sticky-groups/${year}`);
      if (res.ok) {
        const groupData = await res.json();
        setCurrentGroup({
          year: groupData.year,
          group_photo_url: groupData.group_photo_url,
          participants: groupData.participants || [],
        });
      } else {
        // Create new group structure
        setCurrentGroup({
          year,
          group_photo_url: "",
          participants: [],
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

  const handleParticipantToggle = (userId: string) => {
    if (!currentGroup) return;

    setCurrentGroup((prev) => {
      if (!prev) return prev;

      const existingParticipant = prev.participants.find(
        (p) => p.user_id === userId
      );
      if (existingParticipant) {
        // Remove participant
        return {
          ...prev,
          participants: prev.participants.filter((p) => p.user_id !== userId),
        };
      } else {
        // Add participant
        const participant = allParticipants.find((p) => p.user_id === userId);
        if (participant) {
          return {
            ...prev,
            participants: [
              ...prev.participants,
              {
                user_id: userId,
                name: participant.name,
                slug: participant.slug,
                is_curated: true,
              },
            ],
          };
        }
      }
      return prev;
    });
  };

  const handleSaveGroup = async () => {
    if (!currentGroup) return;

    setIsSavingGroup(true);
    try {
      let photoUrl = currentGroup.group_photo_url;

      if (groupPhotoFile) {
        toast({
          title: "Updating group photo",
          description: `Deleting previous images for year ${currentGroup.year}...`,
        });

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
        } else {
          toast({
            title: "Previous images deleted",
            description: `Uploading new group photo for year ${currentGroup.year}...`,
          });
        }

        const { imageUrl, error } = await uploadImage({
          maxSizeMB: 1.3,
          file: groupPhotoFile,
          bucket: "assets",
          folder: `sticky-group/${String(currentGroup.year)}`,
        });

        if (error) throw new Error(error);
        photoUrl = imageUrl;

        toast({
          title: "Group photo updated",
          description: `New photo uploaded for year ${currentGroup.year}.`,
        });
      }

      const payload = {
        year: currentGroup.year,
        group_photo_url: photoUrl,
        participants: currentGroup.participants.map((p) => ({
          user_id: p.user_id,
          is_curated: p.is_curated,
        })),
      };

      const groupExists = years.includes(currentGroup.year);
      let res;

      if (groupExists) {
        // Update existing group
        res = await fetch(`/api/admin/sticky-groups/${currentGroup.year}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group_photo_url: photoUrl,
            participants: payload.participants,
          }),
        });
      } else {
        // Create new group
        res = await fetch("/api/admin/sticky-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save group");

      toast({
        title: "Success",
        description: "Sticky group saved!",
      });

      await mutate("/api/admin/sticky-groups/years");
      await loadYears();
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save group.",
        variant: "destructive",
      });
    } finally {
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
      {/* --- Sticky Groups Management Section --- */}
      <div className="mt-10 border-t pt-8">
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

        {/* Add New Year Input */}
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

        {/* Years List */}
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

      {/* Edit Year Modal */}
      <EditYearModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingYear={editingYear}
        currentGroup={currentGroup}
        isLoadingGroup={isLoadingGroup}
        isSavingGroup={isSavingGroup}
        allParticipants={allParticipants}
        groupExists={years.includes(editingYear!)}
        onPhotoUpload={handlePhotoUpload}
        onParticipantToggle={handleParticipantToggle}
        onSaveGroup={handleSaveGroup}
        onDeleteGroup={handleDeleteGroup}
      />
    </>
  );
};

// Utility functions
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

const uploadImage = async ({
  maxSizeMB,
  file,
  bucket,
  folder,
}: {
  maxSizeMB: number;
  file: File;
  bucket: string;
  folder: string;
}) => {
  const { uploadImage: uploadImageUtil } = await import(
    "@/utils/supabase/storage/client"
  );
  return uploadImageUtil({ maxSizeMB, file, bucket, folder });
};
