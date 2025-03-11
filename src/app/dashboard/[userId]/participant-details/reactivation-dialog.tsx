"use client";

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

interface ReactivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReactivationDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}: ReactivationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="text-black">
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Reactivation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reactivate this participant? This will
            restore their full access to the platform. Would you like to send
            them an email notification?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Reactivate without Email
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Reactivate and Send Email
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
