"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import ParticipantCarryoverModal from "./ParticipantCarryoverModal";

interface TourStatus {
  id: string;
  current_tour_status: "new" | "older";
  updated_at: string;
  updated_by?: string | null;
}

interface TourManagementFormProps {
  onTourStatusChanged?: () => void;
}

export default function TourManagementForm({
  onTourStatusChanged,
}: TourManagementFormProps) {
  const [tourStatus, setTourStatus] = useState<TourStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [showCarryoverModal, setShowCarryoverModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingParticipantSelection, setPendingParticipantSelection] = useState<string[] | null>(null);
  const { toast } = useToast();

  const fetchTourStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/main/tour-status");
      if (!response.ok) {
        throw new Error("Failed to fetch tour status");
      }
      const data = await response.json();
      setTourStatus(data);
      setParticipantCount(null); // Reset participant count
    } catch (error) {
      console.error("Error fetching tour status:", error);
      toast({
        title: "Error",
        description: "Failed to load tour status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTourStatus();
  }, [fetchTourStatus]);

  const handleCloseTourClick = () => {
    if (!tourStatus) return;
    // Check if already closed
    if (tourStatus.current_tour_status === "older") return;
    // Show carryover modal FIRST - select participants before closing
    console.log("Opening carryover modal to select participants first");
    setShowCarryoverModal(true);
  };

  const handleConfirmCloseTour = async () => {
    if (!tourStatus) return;

    // Close confirmation dialog first
    setShowConfirmDialog(false);
    
    // Wait a bit for the confirmation dialog to close completely
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setIsClosing(true);
    
    try {
      // Step 1: Close the tour (this snapshots all participants and events)
      const response = await fetch("/api/admin/main/tour-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_tour_status: "older",
          action: "close",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to close tour");
      }

      const data = await response.json();
      const participantCountResult = data.participantCount || 0;
      
      console.log("Tour closed successfully, participantCount:", participantCountResult);
      console.log("Selected participants to keep active:", pendingParticipantSelection);
      
      // Step 2: Apply the participant selection (set is_active based on selection)
      if (pendingParticipantSelection && pendingParticipantSelection.length >= 0) {
        try {
          const participantResponse = await fetch("/api/admin/main/tour-participants", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              participantIds: pendingParticipantSelection,
            }),
          });

          if (!participantResponse.ok) {
            const error = await participantResponse.json();
            console.error("Error applying participant selection:", error);
            // Don't throw - tour is already closed, just log the error
            toast({
              title: "Warning",
              description: "Tour closed but there was an issue applying participant selection. Please check participants manually.",
              variant: "destructive",
            });
          } else {
            const participantData = await participantResponse.json();
            console.log("Participant selection applied:", participantData);
          }
        } catch (participantError) {
          console.error("Error applying participant selection:", participantError);
          // Don't throw - tour is already closed
        }
      }
      
      setTourStatus({
        ...tourStatus,
        current_tour_status: "older",
        updated_at: data.updated_at,
      });
      setParticipantCount(participantCountResult);

      toast({
        title: "Tour Closed Successfully",
        description: `Tour has been closed. ${participantCountResult} participants and their events have been marked for the previous tour.${pendingParticipantSelection && pendingParticipantSelection.length > 0 ? ` ${pendingParticipantSelection.length} participants will remain active for the next tour.` : ""}`,
      });

      // Clear pending selection
      setPendingParticipantSelection(null);

      // Notify parent component
      if (onTourStatusChanged) {
        onTourStatusChanged();
      }

    } catch (error) {
      console.error("Error closing tour:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to close tour. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleOpenTour = async () => {
    if (!tourStatus) return;

    setIsOpening(true);
    try {
      const response = await fetch("/api/admin/main/tour-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_tour_status: "new",
          action: "open",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open tour");
      }

      const data = await response.json();
      setTourStatus({
        ...tourStatus,
        current_tour_status: "new",
        updated_at: data.updated_at,
      });
      setParticipantCount(null);

      toast({
        title: "New Tour Opened",
        description: data.message || "New tour has been opened successfully.",
      });

      // Notify parent component
      if (onTourStatusChanged) {
        onTourStatusChanged();
      }
    } catch (error) {
      console.error("Error opening tour:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to open tour. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOpening(false);
    }
  };

  const handleCarryoverComplete = (selectedParticipantIds?: string[]) => {
    console.log("Carryover complete, selected participants:", selectedParticipantIds);
    setShowCarryoverModal(false);
    
    // Store the selected participant IDs for when we close the tour
    if (selectedParticipantIds !== undefined) {
      setPendingParticipantSelection(selectedParticipantIds || []);
      
      // Show confirmation dialog after participant selection is saved
      // Wait a bit for modal to close completely
      setTimeout(() => {
        setShowConfirmDialog(true);
      }, 300);
    } else {
      // User cancelled - clear selection and just refresh status
      setPendingParticipantSelection(null);
      fetchTourStatus();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tour Management</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!tourStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tour Management</CardTitle>
          <CardDescription>Failed to load tour status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isOlder = tourStatus.current_tour_status === "older";
  const canOpenTour = isOlder; // Can only open new tour if current is "older"

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tour Management</CardTitle>
          <CardDescription>
            Control the transition between annual tours. Close the current tour
            to snapshot data, or open a new tour to show current data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Tour Status Display */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">
                Current Tour Status
              </Label>
              <div className="text-sm text-muted-foreground">
                {isOlder
                  ? "Showing previous tour snapshot (older data)"
                  : "Showing current tour (new data)"}
              </div>
              {tourStatus.updated_at && (
                <div className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(tourStatus.updated_at).toLocaleString()}
                </div>
              )}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isOlder
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {isOlder ? "Older" : "New"}
            </div>
          </div>

          {/* Close Current Tour Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="close-tour" className="text-base">
                Close Current Tour
              </Label>
              <div className="text-sm text-muted-foreground">
                {isOlder
                  ? "Tour is already closed. You can open a new tour below."
                  : "First, you'll select which participants should remain active for the next tour, then confirm to close the current tour."}
              </div>
            </div>
            <Button
              id="close-tour"
              onClick={handleCloseTourClick}
              disabled={isClosing || isOlder}
              variant={isOlder ? "secondary" : "destructive"}
              className={isOlder ? "" : "bg-red-500 hover:bg-red-600"}
            >
              {isClosing ? "Closing..." : "Close Tour"}
            </Button>
          </div>

          {/* Participant Count Info */}
          {participantCount !== null && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-900">
                {participantCount} participant
                {participantCount !== 1 ? "s" : ""} marked for previous tour
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Use the participant carryover modal to select which participants
                should remain active for the next tour.
              </div>
            </div>
          )}

          {/* Open New Tour Switch */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="open-tour" className="text-base">
                Open New Tour
              </Label>
              <div className="text-sm text-muted-foreground">
                {canOpenTour
                  ? "This will switch the frontend to show only current tour data (new participants and events)."
                  : "You must close the current tour before opening a new one."}
              </div>
            </div>
            <Button
              id="open-tour"
              onClick={handleOpenTour}
              disabled={isOpening || !canOpenTour}
              variant="default"
              className="bg-green-500 hover:bg-green-600"
            >
              {isOpening ? "Opening..." : "Open New Tour"}
            </Button>
          </div>

          
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Close Current Tour?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to close the current tour? This action will:
              </p>
             
              {pendingParticipantSelection && pendingParticipantSelection.length > 0 && (
                <p className="pt-2 bg-green-50 p-2 rounded">
                  You have selected <strong>{pendingParticipantSelection.length} participant{pendingParticipantSelection.length !== 1 ? "s" : ""}</strong> to remain active for the next tour.
                </p>
              )}
              <p className="pt-2">
               {` This will mark all active participants and events for the previous tour. The tour status will change to older."`}
              </p>
              <p className="font-semibold text-red-600">
                This action cannot be undone!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing} className="text-black">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCloseTour}
              disabled={isClosing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isClosing ? "Closing..." : "Yes, Close Tour"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Participant Carryover Modal - Always render but control via open prop */}
      {/* Use key to force remount if needed, mode="current" for selecting before closing */}
      <ParticipantCarryoverModal
        key={`carryover-modal-${showCarryoverModal}`}
        open={showCarryoverModal}
        mode="current"
        onOpenChange={(open) => {
          console.log("ParticipantCarryoverModal onOpenChange called with:", open);
          if (!open) {
            setShowCarryoverModal(false);
            // If modal is closed without completing, clear pending selection
            setPendingParticipantSelection(null);
          }
        }}
        onComplete={handleCarryoverComplete}
      />
    </>
  );
}
