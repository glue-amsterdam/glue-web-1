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
};

export const CheckInQrButton = ({
  targetUserId,
  isModeratorView = false,
  subjectDisplayName,
}: CheckInQrButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleShowQr = async () => {
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

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-full sm:w-auto"
        disabled={isLoading}
        aria-label="Show event check-in QR code"
        onClick={() => void handleShowQr()}
      >
        <QrCode className="size-4" aria-hidden />
        {isLoading ? "Preparing QR…" : "Show check-in QR"}
      </Button>

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
