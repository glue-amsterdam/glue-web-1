"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Edit } from "lucide-react";
import {
  StickyParticipantPicker,
  type StickyParticipantOption,
} from "@/components/admin/about/curated-sticky/StickyParticipantPicker";
import type { StickyMember } from "@/types/sticky-member";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import type { UploadState } from "@/components/image-upload-overlay";
import { RichTextEditor } from "@/components/editor";

type YearGroup = {
  year: number;
  group_photo_url?: string;
  title: string;
  description: string;
  additional_members_text: string;
  members: StickyMember[];
};

type StickyGroupFormContentProps = {
  editingYear: number;
  currentGroup: YearGroup;
  isSavingGroup: boolean;
  photoUploadState?: UploadState | null;
  allParticipants: StickyParticipantOption[];
  groupExists: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddParticipant: (participant: StickyParticipantOption) => void;
  onRemoveMember: (memberKey: string) => void;
  onHeaderChange: (field: "title" | "description", value: string) => void;
  onAdditionalMembersTextChange: (value: string) => void;
  onSaveGroup: () => void;
  onDeleteGroup: (year: number) => void;
};

export const StickyGroupFormContent = ({
  editingYear,
  currentGroup,
  isSavingGroup,
  photoUploadState = null,
  allParticipants,
  groupExists,
  onPhotoUpload,
  onAddParticipant,
  onRemoveMember,
  onHeaderChange,
  onAdditionalMembersTextChange,
  onSaveGroup,
  onDeleteGroup,
}: StickyGroupFormContentProps) => {
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSelectedFilePreview(previewUrl);
    }
    onPhotoUpload(e);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const currentImageUrl = selectedFilePreview || currentGroup.group_photo_url;
  const hasExistingImage = !!currentGroup.group_photo_url;
  const isBusy = isSavingGroup || photoUploadState !== null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Section header</h3>
        <div className="space-y-2">
          <label htmlFor="sticky-title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="sticky-title"
            type="text"
            value={currentGroup.title}
            onChange={(e) => onHeaderChange("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="sticky-description" className="text-sm font-medium">
            Description
          </label>
          <RichTextEditor
            value={currentGroup.description}
            onChange={(value) => onHeaderChange("description", value)}
          />
        </div>
      </div>

      <div>
        <label className="font-medium block mb-2">Group Photo:</label>
        {currentImageUrl ? (
          <AdminImagePreview
            src={currentImageUrl}
            alt="Group photo preview"
            uploadState={photoUploadState}
            aspectClassName="h-32 w-32"
            sizes="128px"
          />
        ) : null}
        {selectedFilePreview && !photoUploadState ? (
          <p className="mt-2 text-xs text-muted-foreground">
            New image selected — save to apply
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleUploadClick}
          variant="outline"
          size="sm"
          className="mt-2 flex items-center gap-2"
          disabled={isBusy}
        >
          {hasExistingImage ? (
            <>
              <Edit className="w-4 h-4" />
              Modify Image
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Image
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isBusy}
        />
      </div>

      <StickyParticipantPicker
        allParticipants={allParticipants}
        selectedMembers={currentGroup.members}
        editingYear={editingYear}
        onAddParticipant={onAddParticipant}
        onRemoveMember={onRemoveMember}
      />

      <div>
        <label htmlFor="additional-members-text" className="font-medium block">
          Additional members (no profile)
        </label>
        <p className="text-xs text-gray-500 mt-1 mb-2">
          Names without an active profile. Shown as plain text at the end of the
          participant list (comma-separated).
        </p>
        <Textarea
          id="additional-members-text"
          value={currentGroup.additional_members_text}
          onChange={(e) => onAdditionalMembersTextChange(e.target.value)}
          placeholder="Ana López, Pedro Ruiz, Studio X"
          rows={4}
          aria-label="Additional members without profile"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          onClick={onSaveGroup}
          disabled={isBusy}
          className="flex-1"
        >
          {isSavingGroup ? "Saving..." : "Save Group"}
        </Button>
        {groupExists ? (
          <Button
            onClick={() => onDeleteGroup(editingYear)}
            variant="destructive"
            disabled={isBusy}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
};
