"use client";

import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const QrCodePreview = dynamic(
  () => import("@/app/dashboard/[userId]/qr-code/qr-code-preview"),
  {
    loading: () => (
      <p className="text-sm">Generating QR preview...</p>
    ),
  }
);

type CheckInQrDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  isModeratorView?: boolean;
  subjectDisplayName?: string | null;
};

export const CheckInQrDialog = ({
  open,
  onOpenChange,
  token,
  isModeratorView = false,
  subjectDisplayName,
}: CheckInQrDialogProps) => {
  const title =
    isModeratorView && subjectDisplayName
      ? `Check-in QR for ${subjectDisplayName}`
      : "Your Check-In QR";

  const description = isModeratorView
    ? "QR code for event check-in (moderator view)."
    : "Present this QR if any organizer asks you to scan it for check-in.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] md:max-w-[500px] lg:max-w-[600px] rounded-none">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="max-w-[75%]">
            {description}
          </DialogDescription>
        </DialogHeader>
        {token ? (
          <QrCodePreview token={token} />
        ) : (
          <p className="text-sm text-white/70">No QR token available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
