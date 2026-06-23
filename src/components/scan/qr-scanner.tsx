"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type QrScannerTarget =
  | {
      mode: "event";
      eventId: string;
      label: string;
    }
  | {
      mode: "location-day";
      dayId: string;
      locationId: string;
      label: string;
    };

type QrScannerProps = {
  target: QrScannerTarget;
  timeZone: string;
  onScanSuccess?: (target: QrScannerTarget) => void;
};

type ScanStatus = {
  type: "idle" | "processing" | "success" | "error";
  message: string;
};

type CameraPhase = "idle" | "starting" | "scanning" | "blocked";

const isDomException = (
  error: unknown,
): error is DOMException & { name: string } =>
  error instanceof DOMException ||
  (typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (error as DOMException).name === "string");

const isActiveSession = (session: number, sessionRef: { current: number }) =>
  session === sessionRef.current;

const getScanErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (typeof data.error === "string" && data.error.trim().length > 0) {
    return data.error;
  }

  return fallback;
};

export const QrScanner = ({
  target,
  timeZone,
  onScanSuccess,
}: QrScannerProps) => {
  const containerId = useId().replace(/:/g, "");
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const startSessionRef = useRef(0);
  const targetRef = useRef(target);
  const timeZoneRef = useRef(timeZone);
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>("idle");
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    type: "idle",
    message: "",
  });

  targetRef.current = target;
  timeZoneRef.current = timeZone;

  const cleanupScannerInstance = useCallback(async () => {
    const instance = scannerRef.current;
    scannerRef.current = null;
    if (!instance) return;
    try {
      if (instance.isScanning) {
        await instance.stop();
      }
      instance.clear();
    } catch {
      /* ignore best-effort cleanup */
    }
  }, []);

  const handleDecoded = useCallback(async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setScanStatus({ type: "processing", message: "Checking in…" });

    const currentTarget = targetRef.current;
    const currentTimeZone = timeZoneRef.current;

    try {
      const endpoint =
        currentTarget.mode === "event" ? "/api/scan" : "/api/scan/location-day";
      const body =
        currentTarget.mode === "event"
          ? {
              token: decodedText,
              event_id: currentTarget.eventId,
              time_zone: currentTimeZone,
            }
          : {
              token: decodedText,
              day_id: currentTarget.dayId,
              location_id: currentTarget.locationId,
              time_zone: currentTimeZone,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.status === 200) {
        onScanSuccess?.(currentTarget);
        setScanStatus({
          type: "success",
          message: "Visitor checked in.",
        });
        return;
      }

      if (response.status === 409) {
        setScanStatus({
          type: "error",
          message:
            currentTarget.mode === "event"
              ? "Already checked in for this event."
              : "Already checked in at this venue today.",
        });
        return;
      }

      if (!response.ok) {
        const message = await getScanErrorMessage(
          response,
          "Unexpected scan error. Try again.",
        );
        setScanStatus({
          type: "error",
          message,
        });
        return;
      }
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
  }, [onScanSuccess]);

  useEffect(() => {
    const session = ++startSessionRef.current;

    const startCamera = async () => {
      setScanStatus({ type: "idle", message: "" });
      setCameraPhase("starting");

      await cleanupScannerInstance();
      if (!isActiveSession(session, startSessionRef)) return;

      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!isActiveSession(session, startSessionRef)) return;

        const instance = new Html5Qrcode(containerId, { verbose: false });
        scannerRef.current = instance;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        };

        const onScanFailure = () => {};

        try {
          await instance.start(
            { facingMode: "environment" },
            config,
            (text) => void handleDecoded(text),
            onScanFailure,
          );
        } catch {
          if (!isActiveSession(session, startSessionRef)) {
            await cleanupScannerInstance();
            return;
          }

          const devices = await Html5Qrcode.getCameras();
          if (!isActiveSession(session, startSessionRef)) {
            await cleanupScannerInstance();
            return;
          }

          if (!devices.length) {
            throw new Error("No camera found on this device.");
          }

          await instance.start(
            devices[0].id,
            config,
            (text) => void handleDecoded(text),
            onScanFailure,
          );
        }

        if (!isActiveSession(session, startSessionRef)) {
          await cleanupScannerInstance();
          return;
        }

        setCameraPhase("scanning");
      } catch (error) {
        if (!isActiveSession(session, startSessionRef)) return;

        console.error("Failed to start camera:", error);
        await cleanupScannerInstance();

        if (isDomException(error) && error.name === "NotAllowedError") {
          setCameraPhase("blocked");
          setScanStatus({
            type: "error",
            message:
              "Camera access was blocked. Close this window, tap the card again, and allow camera access when prompted.",
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

    void startCamera();

    return () => {
      startSessionRef.current += 1;
      void cleanupScannerInstance();
    };
  }, [cleanupScannerInstance, containerId, handleDecoded]);

  const statusBannerClass =
    scanStatus.type === "success"
      ? "bg-green-500 text-white"
      : scanStatus.type === "error"
        ? "bg-red-500 text-white"
        : scanStatus.type === "processing"
          ? "bg-amber-500 text-white"
          : "bg-muted text-muted-foreground";

  const showStatusBanner =
    scanStatus.message &&
    (scanStatus.type === "processing" ||
      scanStatus.type === "success" ||
      scanStatus.type === "error");

  return (
    <div className="space-y-3">
      <div
        id={containerId}
        className="min-h-[220px] w-full overflow-hidden rounded-lg bg-neutral-900 [&_video]:max-h-[220px] [&_video]:w-full"
      />

      {showStatusBanner ? (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "w-full rounded-lg p-4 text-center text-xl font-bold shadow-md sm:text-2xl",
            statusBannerClass,
          )}
        >
          {scanStatus.message}
        </p>
      ) : cameraPhase === "starting" ? (
        <p className="text-center text-sm text-muted-foreground">
          Starting camera…
        </p>
      ) : cameraPhase === "scanning" ? (
        <p className="text-center text-sm text-muted-foreground">
          Point at the visitor QR code.
        </p>
      ) : null}
    </div>
  );
};
