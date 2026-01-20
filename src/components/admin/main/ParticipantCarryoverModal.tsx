"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Participant {
  user_id: string;
  slug: string;
  status: string;
  is_active: boolean;
  was_active_last_year: boolean;
  user_info: {
    user_id: string;
    user_name: string;
  } | null;
}

interface ParticipantCarryoverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (selectedParticipantIds?: string[]) => void;
  mode?: "current" | "previous"; // "current" = before closing, "previous" = after closing
}

export default function ParticipantCarryoverModal({
  open,
  onOpenChange,
  onComplete,
  mode = "current",
}: ParticipantCarryoverModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchParticipants = useCallback(async (mode: "current" | "previous" = "current") => {
    setIsLoading(true);
    try {
      // Fetch current active participants (before closing) or previous tour participants (after closing)
      const response = await fetch(`/api/admin/main/tour-participants?mode=${mode}`);
      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }
      const data = await response.json();
      setParticipants(data || []);

      // Pre-select participants that are currently active
      const activeIds = new Set<string>(
        data
          .filter((p: Participant) => p.is_active)
          .map((p: Participant) => p.user_id)
      );
      setSelectedIds(activeIds);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast({
        title: "Error",
        description: "Failed to load participants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      // Fetch participants based on mode
      fetchParticipants(mode);
    }
  }, [open, fetchParticipants, mode]);

  const handleToggleParticipant = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === participants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(participants.map((p) => p.user_id)));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // If mode is "current", we're selecting BEFORE closing tour
      // Just store the selection, don't update database yet
      if (mode === "current") {
        toast({
          title: "Participants Selected",
          description: `You've selected ${selectedIds.size} participant${selectedIds.size !== 1 ? "s" : ""} to remain active. Please confirm to close the tour.`,
        });
        
        onOpenChange(false);
        if (onComplete) {
          // Pass the selected participant IDs to the callback (to be applied after closing)
          onComplete(Array.from(selectedIds));
        }
        setIsSaving(false);
        return;
      }
      
      // If mode is "previous", we're selecting AFTER closing tour
      // Update the database with the selection
      const response = await fetch("/api/admin/main/tour-participants", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update participants");
      }

      const data = await response.json();
      toast({
        title: "Participants Updated",
        description: `Successfully updated participant carryover. ${data.activeParticipants} participants will remain active for the next tour.`,
      });

      onOpenChange(false);
      if (onComplete) {
        onComplete(Array.from(selectedIds));
      }
    } catch (error) {
      console.error("Error saving participants:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update participants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Log when modal should be visible
  useEffect(() => {
    console.log("ParticipantCarryoverModal render - open:", open, "participants:", participants.length);
    if (open) {
      console.log("Modal is being requested to open");
    }
  }, [open, participants.length]);

  // Debug: Log when component mounts/unmounts
  useEffect(() => {
    console.log("ParticipantCarryoverModal mounted");
    return () => {
      console.log("ParticipantCarryoverModal unmounted");
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col z-[100]" data-testid="participant-carryover-modal">
        <DialogHeader>
          <DialogTitle className="text-black">Participant Carryover Selection</DialogTitle>
          <DialogDescription className="text-black">
            {mode === "current" 
              ? "Select which active participants should remain active for the next tour. All other participants will be set to inactive after closing."
              : "Select which participants from the previous tour should remain active for the next tour. All other participants will be set to inactive."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header with Select All */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <Label className="text-sm font-medium text-black">
              {participants.length} active participant
              {participants.length !== 1 ? "s" : ""} {mode === "current" ? "in current tour" : "from previous tour"}
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading || isSaving}
              className="text-black"
            >
              {selectedIds.size === participants.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-black">
                  Loading participants...
                </span>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8 text-sm text-black space-y-2">
                <p>No participants found from the previous tour.</p>
                <p className="text-xs text-black">
                  You can still proceed. All participants will be set to inactive for the next tour.
                </p>
              </div>
            ) : (
              participants.map((participant) => {
                const userInfo = Array.isArray(participant.user_info)
                  ? participant.user_info[0]
                  : participant.user_info;
                const userName = userInfo?.user_name || "Unknown User";
                const isSelected = selectedIds.has(participant.user_id);

                return (
                  <div
                    key={participant.user_id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      id={participant.user_id}
                      checked={isSelected}
                      onCheckedChange={() =>
                        handleToggleParticipant(participant.user_id)
                      }
                      disabled={isSaving}
                    />
                    <Label
                      htmlFor={participant.user_id}
                      className="flex-1 cursor-pointer font-normal text-black"
                    >
                      <div className="font-medium text-black">{userName}</div>
                      <div className="text-xs text-black">
                        {participant.slug}
                      </div>
                    </Label>
                    {participant.is_active && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-black rounded-full">
                        Currently Active
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-black">
              {selectedIds.size} of {participants.length} selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  if (onComplete) {
                    onComplete(undefined); // Pass undefined to indicate cancellation
                  }
                }}
                disabled={isSaving}
                className="text-black"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isLoading} className="text-white">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Selection"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
