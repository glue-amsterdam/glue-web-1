"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Search, Upload, Edit } from "lucide-react";

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

interface EditYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingYear: number | null;
  currentGroup: YearGroup | null;
  isLoadingGroup: boolean;
  isSavingGroup: boolean;
  allParticipants: Participant[];
  groupExists: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onParticipantToggle: (userId: string) => void;
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
  allParticipants,
  groupExists,
  onPhotoUpload,
  onParticipantToggle,
  onSaveGroup,
  onDeleteGroup,
}: EditYearModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return allParticipants;

    const query = searchQuery.toLowerCase();
    return allParticipants.filter(
      (participant) =>
        participant.name.toLowerCase().includes(query) ||
        participant.slug.toLowerCase().includes(query)
    );
  }, [allParticipants, searchQuery]);

  // Handle file selection with preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setSelectedFilePreview(previewUrl);
    }
    onPhotoUpload(e);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Clean up preview URL when modal closes
  const handleClose = () => {
    if (selectedFilePreview) {
      URL.revokeObjectURL(selectedFilePreview);
      setSelectedFilePreview(null);
    }
    setSearchQuery("");
    onClose();
  };

  // Get the current image to display (selected file preview or existing image)
  const currentImageUrl = selectedFilePreview || currentGroup?.group_photo_url;
  const hasExistingImage = !!currentGroup?.group_photo_url;

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
        ) : currentGroup ? (
          <div className="space-y-6">
            {/* Group Photo Upload */}
            <div>
              <label className="font-medium block mb-2">Group Photo:</label>
              {currentImageUrl && (
                <div className="mb-3">
                  <Image
                    src={currentImageUrl}
                    alt="Group Photo Preview"
                    className="w-32 h-32 object-cover rounded border"
                    width={256}
                    height={256}
                  />
                  {selectedFilePreview && (
                    <p className="text-xs text-blue-600 mt-1">
                      New image selected (will be uploaded when saved)
                    </p>
                  )}
                </div>
              )}

              {/* Custom Upload Button */}
              <Button
                type="button"
                onClick={handleUploadClick}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isSavingGroup}
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

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Participants Assignment with Search */}
            <div>
              <label className="font-medium block mb-2">
                Assign Participants ({currentGroup.participants.length}{" "}
                selected):
              </label>

              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search participants by name or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border rounded p-3 bg-gray-50">
                {allParticipants.length === 0 ? (
                  <p className="text-gray-500">Loading participants...</p>
                ) : filteredParticipants.length === 0 ? (
                  <p className="text-gray-500">
                    {searchQuery
                      ? "No participants found matching your search."
                      : "No participants available."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredParticipants.map((participant) => {
                      const isSelected = currentGroup.participants.some(
                        (p) => p.user_id === participant.user_id
                      );
                      return (
                        <div
                          key={participant.user_id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              onParticipantToggle(participant.user_id)
                            }
                            className="rounded"
                          />
                          <span className="flex-1">
                            <a
                              href={`/participants/${participant.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {participant.name}
                            </a>
                            <span className="text-xs text-gray-500 ml-2">
                              /{participant.slug}
                            </span>
                          </span>
                          {isSelected && (
                            <Badge variant="secondary" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Results Summary */}
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing {filteredParticipants.length} of{" "}
                  {allParticipants.length} participants
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={onSaveGroup}
                disabled={isSavingGroup}
                className="flex-1"
              >
                {isSavingGroup ? "Saving..." : "Save Group"}
              </Button>
              {groupExists && (
                <Button
                  onClick={() => onDeleteGroup(editingYear!)}
                  variant="destructive"
                  disabled={isSavingGroup}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={isSavingGroup}
              >
                Cancel
              </Button>
            </div>
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
