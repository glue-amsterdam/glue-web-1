"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { StickyParticipantOption } from "@/components/admin/about/curated-sticky/StickyParticipantPicker";
import type { StickyMember } from "@/types/sticky-member";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";
import {
  getStickyMemberKey,
  stickyMemberFromApi,
  stickyMembersToPayload,
} from "@/types/sticky-member";
import { yearlySectionHeaderSchema } from "@/schemas/yearly-section-header-schema";
import { StickyGroupFormContent } from "./StickyGroupFormContent";

type YearGroup = {
  year: number;
  group_photo_url?: string;
  title: string;
  description: string;
  additional_members_text: string;
  members: StickyMember[];
};

const parseApiError = async (res: Response) => {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return body.error ?? `Failed to save group (${res.status})`;
};

type StickyGroupEditorProps = {
  year: number;
  onSaved?: () => void;
  onDeleted?: () => void;
};

export const StickyGroupEditor = ({
  year,
  onSaved,
  onDeleted,
}: StickyGroupEditorProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [photoUploadState, setPhotoUploadState] = useState<UploadState | null>(
    null
  );
  const handleUploadProgress = createUploadProgressHandler(setPhotoUploadState);

  const [currentGroup, setCurrentGroup] = useState<YearGroup | null>(null);
  const [groupExistsInDb, setGroupExistsInDb] = useState(false);
  const [groupPhotoFile, setGroupPhotoFile] = useState<File | null>(null);
  const [allParticipants, setAllParticipants] = useState<
    StickyParticipantOption[]
  >([]);

  const loadAllParticipants = useCallback(async () => {
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
  }, [toast]);

  const loadGroup = useCallback(async () => {
    setIsLoadingGroup(true);
    setGroupPhotoFile(null);
    try {
      await loadAllParticipants();

      const res = await fetch(`/api/admin/sticky-groups/${year}`);
      if (res.ok) {
        const groupData = await res.json();
        setGroupExistsInDb(true);
        setCurrentGroup({
          year: groupData.year,
          group_photo_url: groupData.group_photo_url,
          title: groupData.title ?? "",
          description: groupData.description ?? "",
          additional_members_text: groupData.additional_members_text ?? "",
          members: (groupData.members ?? groupData.participants ?? []).map(
            stickyMemberFromApi
          ),
        });
      } else {
        setGroupExistsInDb(false);
        setCurrentGroup({
          year,
          group_photo_url: "",
          title: "",
          description: "",
          additional_members_text: "",
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
  }, [year, loadAllParticipants, toast]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupPhotoFile(file);
    }
  };

  const handleAddParticipant = (participant: StickyParticipantOption) => {
    setCurrentGroup((prev) => {
      if (!prev) return prev;

      if (prev.members.some((member) => member.user_id === participant.user_id)) {
        return prev;
      }

      return {
        ...prev,
        members: [
          ...prev.members,
          {
            user_id: participant.user_id,
            name: participant.name,
            slug: participant.slug,
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

  const handleHeaderChange = (field: "title" | "description", value: string) => {
    setCurrentGroup((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleAdditionalMembersTextChange = (value: string) => {
    setCurrentGroup((prev) => {
      if (!prev) return prev;
      return { ...prev, additional_members_text: value };
    });
  };

  const handleSaveGroup = async () => {
    if (!currentGroup) return;

    const headerValidation = yearlySectionHeaderSchema.safeParse({
      title: currentGroup.title,
      description: currentGroup.description,
    });

    if (!headerValidation.success) {
      toast({
        title: "Validation error",
        description: headerValidation.error.issues[0]?.message ?? "Invalid header fields.",
        variant: "destructive",
      });
      return;
    }

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

      const payload = {
        group_photo_url: photoUrl,
        title: currentGroup.title,
        description: currentGroup.description,
        additional_members_text: currentGroup.additional_members_text,
        members: membersPayload,
      };

      let res: Response;

      if (groupExistsInDb) {
        res = await fetch(`/api/admin/sticky-groups/${currentGroup.year}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/sticky-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: currentGroup.year,
            ...payload,
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
      setGroupPhotoFile(null);

      toast({
        title: "Success",
        description:
          savedMemberCount > 0
            ? `Sticky group saved with ${savedMemberCount} member${savedMemberCount === 1 ? "" : "s"}.`
            : "Sticky group saved!",
      });

      router.refresh();
      await loadGroup();
      onSaved?.();
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

  const handleDeleteGroup = async () => {
    if (
      !confirm(`Are you sure you want to delete the group for year ${year}?`)
    ) {
      return;
    }

    setIsSavingGroup(true);
    try {
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
      }

      const res = await fetch(`/api/admin/sticky-groups/${year}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete group");

      toast({
        title: "Success",
        description: "Sticky group deleted!",
      });

      router.refresh();
      setGroupExistsInDb(false);
      setCurrentGroup({
        year,
        group_photo_url: "",
        title: "",
        description: "",
        additional_members_text: "",
        members: [],
      });
      onDeleted?.();
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

  if (isLoadingGroup) {
    return <p className="text-sm text-gray-500">Loading sticky group...</p>;
  }

  if (!currentGroup) {
    return <p className="text-sm text-gray-500">No group data available.</p>;
  }

  return (
    <StickyGroupFormContent
      editingYear={year}
      currentGroup={currentGroup}
      isSavingGroup={isSavingGroup}
      photoUploadState={photoUploadState}
      allParticipants={allParticipants}
      groupExists={groupExistsInDb}
      onPhotoUpload={handlePhotoUpload}
      onAddParticipant={handleAddParticipant}
      onRemoveMember={handleRemoveMember}
      onHeaderChange={handleHeaderChange}
      onAdditionalMembersTextChange={handleAdditionalMembersTextChange}
      onSaveGroup={handleSaveGroup}
      onDeleteGroup={() => handleDeleteGroup()}
    />
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
