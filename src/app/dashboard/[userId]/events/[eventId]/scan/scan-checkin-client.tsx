"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ScanCheckInClientProps = {
  eventId: string;
};

type ScanStatus = {
  type: "idle" | "success" | "error";
  message: string;
};

type CameraPhase = "idle" | "starting" | "scanning" | "blocked";

const isDomException = (
  error: unknown
): error is DOMException & { name: string } =>
  error instanceof DOMException ||
  (typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (error as DOMException).name === "string");

export default function ScanCheckInClient({ eventId }: ScanCheckInClientProps) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>("idle");
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    type: "idle",
    message: "",
  });

  const cleanupScannerInstance = useCallback(async () => {
    const instance = scannerRef.current;
    if (!instance) return;
    try {
      if (instance.isScanning) {
        await instance.stop();
      }
      instance.clear();
    } catch {
      /* ignore best-effort cleanup */
    }
    scannerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      void cleanupScannerInstance();
    };
  }, [cleanupScannerInstance]);

  const handleDecoded = useCallback(
    async (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            token: decodedText,
            event_id: eventId,
          }),
        });

        if (response.status === 200) {
          setScanStatus({
            type: "success",
            message: "Success: visitor checked in.",
          });
          return;
        }

        if (response.status === 409) {
          setScanStatus({
            type: "error",
            message: "Already checked in for this event.",
          });
          return;
        }

        if (response.status === 400) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
            code?: string;
          };
          setScanStatus({
            type: "error",
            message:
              typeof data.error === "string" && data.error.trim().length > 0
                ? data.error
                : "Invalid QR token.",
          });
          return;
        }

        if (response.status === 403) {
          setScanStatus({
            type: "error",
            message: "You are not allowed to scan this event.",
          });
          return;
        }

        setScanStatus({
          type: "error",
          message: "Unexpected scan error. Try again.",
        });
      } catch (error) {
        console.error("Scan request error:", error);
        setScanStatus({
          type: "error",
          message: "Network error while sending scan.",
        });
      } finally {
        window.setTimeout(() => {
          isProcessingRef.current = false;
        }, 900);
      }
    },
    [eventId]
  );

  const handleStartCamera = async () => {
    setScanStatus({ type: "idle", message: "" });
    setCameraPhase("starting");

    await cleanupScannerInstance();

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const containerId = "event-checkin-scanner";

      const instance = new Html5Qrcode(containerId, { verbose: false });
      scannerRef.current = instance;

      const config = {
        fps: 10,
        qrbox: { width: 260, height: 260 },
      };

      const onScanFailure = () => {};

      try {
        await instance.start(
          { facingMode: "environment" },
          config,
          (text) => void handleDecoded(text),
          onScanFailure
        );
      } catch {
        const devices = await Html5Qrcode.getCameras();
        if (!devices.length) {
          throw new Error("No camera found on this device.");
        }
        await instance.start(
          devices[0].id,
          config,
          (text) => void handleDecoded(text),
          onScanFailure
        );
      }

      setCameraPhase("scanning");
    } catch (error) {
      console.error("Failed to start camera:", error);
      await cleanupScannerInstance();

      if (isDomException(error) && error.name === "NotAllowedError") {
        setCameraPhase("blocked");
        setScanStatus({
          type: "error",
          message:
            "Camera access was blocked or dismissed. Tap “Start camera” again and choose “Allow”, or enable the camera for this site in your browser settings.",
        });
        return;
      }

      if (isDomException(error) && error.name === "NotFoundError") {
        setCameraPhase("idle");
        setScanStatus({
          type: "error",
          message:
            "No camera was found. Connect a camera or use a device with a camera.",
        });
        return;
      }

      setCameraPhase("idle");
      setScanStatus({
        type: "error",
        message:
          "Could not start the camera. Use HTTPS (or localhost), grant permission, and try again.",
      });
    }
  };

  const handleStopCamera = async () => {
    await cleanupScannerInstance();
    setCameraPhase("idle");
    setScanStatus({ type: "idle", message: "" });
  };

  const handleResetStatus = () => {
    setScanStatus({ type: "idle", message: "" });
  };

  const statusClass =
    scanStatus.type === "success"
      ? "text-green-300"
      : scanStatus.type === "error"
        ? "text-amber-200"
        : "text-white/80";

  return (
    <div className="space-y-4 rounded-lg border border-white/20 p-4">
      <p className="text-sm text-white/80">
        Use a secure connection (HTTPS or localhost). Tap{" "}
        <span className="font-medium text-white">Start camera</span>, then
        allow access when the browser asks so the scanner can run.
      </p>

      <div
        id="event-checkin-scanner"
        className="min-h-[280px] overflow-hidden rounded-lg bg-neutral-900"
      />

      {scanStatus.message ? (
        <p className={`text-sm ${statusClass}`}>{scanStatus.message}</p>
      ) : cameraPhase === "scanning" ? (
        <p className="text-sm text-white/80">Point the camera at the visitor QR code.</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="default"
          disabled={cameraPhase === "starting"}
          aria-label="Start camera for QR scanning"
          onClick={() => void handleStartCamera()}
        >
          {cameraPhase === "starting"
            ? "Starting camera…"
            : cameraPhase === "scanning"
              ? "Restart camera"
              : "Start camera"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={cameraPhase !== "scanning"}
          aria-label="Stop camera"
          onClick={() => void handleStopCamera()}
        >
          Stop camera
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={!scanStatus.message}
          aria-label="Clear scan status message"
          onClick={handleResetStatus}
        >
          Clear message
        </Button>
      </div>
    </div>
  );
}
