"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { StickyParticipantOption } from "./StickyParticipantPicker";
import type { StickyMember } from "@/types/sticky-member";
import type { UploadState } from "@/components/image-upload-overlay";
import { StickyGroupFormContent } from "@/components/admin/yearly-content/StickyGroupFormContent";

type YearGroup = {
  year: number;
  group_photo_url?: string;
  members: StickyMember[];
};

interface EditYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingYear: number | null;
  currentGroup: YearGroup | null;
  isLoadingGroup: boolean;
  isSavingGroup: boolean;
  photoUploadState?: UploadState | null;
  allParticipants: StickyParticipantOption[];
  groupExists: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddParticipant: (participant: StickyParticipantOption) => void;
  onAddResolvedUser: (member: {
    user_id: string;
    name: string;
    slug: string;
  }) => void;
  onAddDisplayName: (name: string) => void;
  onRemoveMember: (memberKey: string) => void;
  onSaveGroup: () => void;
  onDeleteGroup: (year: number) => void;
}

export const EditYearModal = ({
  isOpen,
  onClose,
  editingYear,
  currentGroup,
  isLoadingGroup,
  isSavingGroup,
  photoUploadState = null,
  allParticipants,
  groupExists,
  onPhotoUpload,
  onAddParticipant,
  onAddResolvedUser,
  onAddDisplayName,
  onRemoveMember,
  onSaveGroup,
  onDeleteGroup,
}: EditYearModalProps) => {
  const handleClose = () => {
    onClose();
  };

  const isBusy = isSavingGroup || photoUploadState !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-uiblack">
        <DialogHeader>
          <DialogTitle>
            {editingYear ? `Edit Year ${editingYear}` : "Edit Group"}
          </DialogTitle>
        </DialogHeader>

        {isLoadingGroup ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading group data...</p>
          </div>
        ) : currentGroup && editingYear ? (
          <div className="space-y-4">
            <StickyGroupFormContent
              editingYear={editingYear}
              currentGroup={currentGroup}
              isSavingGroup={isSavingGroup}
              photoUploadState={photoUploadState}
              allParticipants={allParticipants}
              groupExists={groupExists}
              onPhotoUpload={onPhotoUpload}
              onAddParticipant={onAddParticipant}
              onAddResolvedUser={onAddResolvedUser}
              onAddDisplayName={onAddDisplayName}
              onRemoveMember={onRemoveMember}
              onSaveGroup={onSaveGroup}
              onDeleteGroup={onDeleteGroup}
            />
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isBusy}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No group data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
