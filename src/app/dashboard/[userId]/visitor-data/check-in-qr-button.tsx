"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckInQrDialog } from "@/app/dashboard/[userId]/visitor-data/check-in-qr-dialog";

const buildCheckInQrUrl = (targetUserId?: string) => {
  const base = "/api/users/check-in-qr";
  if (!targetUserId) return base;
  return `${base}?targetUserId=${encodeURIComponent(targetUserId)}`;
};

type CheckInQrButtonProps = {
  targetUserId?: string;
  isModeratorView?: boolean;
  subjectDisplayName?: string | null;
  isProfileComplete: boolean;
};

export const CheckInQrButton = ({
  targetUserId,
  isModeratorView = false,
  subjectDisplayName,
  isProfileComplete,
}: CheckInQrButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleShowQr = async () => {
    if (!isProfileComplete) return;

    setIsLoading(true);
    try {
      const response = await fetch(buildCheckInQrUrl(targetUserId));
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "We could not prepare your check-in QR. Please try again."
        );
      }

      if (typeof data.token !== "string" || !data.token.trim()) {
        throw new Error("Invalid QR response. Please try again.");
      }

      setToken(data.token);
      setDialogOpen(true);
    } catch (error) {
      toast({
        title: "Check-in QR unavailable",
        description:
          error instanceof Error
            ? error.message
            : "We could not prepare your check-in QR. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setToken(null);
    }
  };

  const incompleteHelpText = isModeratorView
    ? "This visitor must complete Age range and Work area in their check-in profile before a QR can be generated."
    : "Complete Age range and Work area in the form below, then save your profile to unlock your check-in QR.";

  const helpText = isProfileComplete
    ? isModeratorView
      ? "Open the check-in QR for this visitor to scan at the event."
      : "Present this QR if any organizer asks you to scan it for check-in."
    : incompleteHelpText;

  return (
    <>
      <section
        className="mt-6 mb-8 rounded-none border border-(--black-color) bg-(--white-color) p-5 md:p-6"
        aria-labelledby="check-in-qr-heading"
      >
        <h2 id="check-in-qr-heading" className="base-text-size font-normal mb-2">
          {isModeratorView && subjectDisplayName
            ? `Check-in QR for ${subjectDisplayName}`
            : "Your check-in QR"}
        </h2>
        <p className="mini-text-size mb-4 max-w-prose">{helpText}</p>
        <Button
          type="button"
          variant="default"
          className="w-full h-12 text-base gap-3"
          disabled={isLoading || !isProfileComplete}
          aria-label="Show your check-in QR code"
          aria-disabled={!isProfileComplete}
          onClick={() => void handleShowQr()}
        >
          <QrCode className="size-6 shrink-0" aria-hidden />
          {isLoading
            ? "Preparing QR…"
            : isProfileComplete
              ? "Show your check-in QR"
              : "Complete profile to unlock QR"}
        </Button>
      </section>

      <CheckInQrDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        token={token}
        isModeratorView={isModeratorView}
        subjectDisplayName={subjectDisplayName}
      />
    </>
  );
};
