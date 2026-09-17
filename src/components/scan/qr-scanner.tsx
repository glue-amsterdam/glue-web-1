"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  LOOKING_HINT_AFTER_MS,
  buildQrBox,
  getAuthErrorMessage,
  pickRearCameraId,
} from "@/lib/scan/qr-scanner-helpers";
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

type Html5QrcodeInstance = import("html5-qrcode").Html5Qrcode;
type Html5QrcodeStatic = typeof import("html5-qrcode").Html5Qrcode;
type Html5QrcodeSupportedFormatsEnum =
  typeof import("html5-qrcode").Html5QrcodeSupportedFormats;

const isDomException = (
  error: unknown,
): error is DOMException & { name: string } =>
  error instanceof DOMException ||
  (typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (error as DOMException).name === "string");

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

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

/**
 * html5-qrcode's start() begins a state transition BEFORE validating
 * cameraIdOrConfig. Invalid configs throw without cancel(), leaving the
 * instance permanently stuck. cameraIdOrConfig must be either a device id
 * string or a single-key object: { facingMode: "user" | "environment" }.
 */
const FACING_MODE_ENVIRONMENT = { facingMode: "environment" } as const;

const scannerConfig = {
  fps: 15,
  qrbox: buildQrBox,
  disableFlip: false,
};

const stopScannerSafely = async (instance: Html5QrcodeInstance | null) => {
  if (!instance) return;

  try {
    if (instance.isScanning) {
      await instance.stop();
    }
  } catch {
    /* ignore best-effort stop */
  }

  try {
    instance.clear();
  } catch {
    /* ignore best-effort clear */
  }
};

const emptyScannerContainer = (containerId: string) => {
  const element = document.getElementById(containerId);
  if (!element) return;
  element.replaceChildren();
};

export const QrScanner = ({
  target,
  timeZone,
  onScanSuccess,
}: QrScannerProps) => {
  const { toast } = useToast();
  const containerId = useId().replace(/:/g, "");
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const isProcessingRef = useRef(false);
  const targetRef = useRef(target);
  const timeZoneRef = useRef(timeZone);
  const onScanSuccessRef = useRef(onScanSuccess);
  const toastRef = useRef(toast);
  const failureStartedAtRef = useRef<number | null>(null);
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>("idle");
  const [showLookingHint, setShowLookingHint] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    type: "idle",
    message: "",
  });

  targetRef.current = target;
  timeZoneRef.current = timeZone;
  onScanSuccessRef.current = onScanSuccess;
  toastRef.current = toast;

  const handleDecoded = useCallback(async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    failureStartedAtRef.current = null;
    setShowLookingHint(false);
    setScanStatus({ type: "processing", message: "Checking in…" });

    const currentTarget = targetRef.current;
    const currentTimeZone = timeZoneRef.current;

    try {
      const endpoint =
        currentTarget.mode === "event"
          ? "/api/scan"
          : "/api/scan/location-day";
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
        onScanSuccessRef.current?.(currentTarget);
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
        const apiMessage = await getScanErrorMessage(
          response,
          "Unexpected scan error. Try again.",
        );
        const message =
          response.status === 401 || response.status === 403
            ? getAuthErrorMessage(response.status, apiMessage)
            : apiMessage;

        setScanStatus({
          type: "error",
          message,
        });

        if (response.status === 401 || response.status === 403) {
          toastRef.current({
            title:
              response.status === 401
                ? "Sign in required"
                : "Scan not allowed",
            description: message,
            variant: "destructive",
          });
        }
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    let activeStart: Promise<void> | null = null;

    const createInstance = (
      Html5Qrcode: Html5QrcodeStatic,
      Html5QrcodeSupportedFormats: Html5QrcodeSupportedFormatsEnum,
    ) => {
      emptyScannerContainer(containerId);
      const instance = new Html5Qrcode(containerId, {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        useBarCodeDetectorIfSupported: true,
      });
      scannerRef.current = instance;
      return instance;
    };

    const startInstance = async (
      instance: Html5QrcodeInstance,
      cameraIdOrConfig: string | { facingMode: "environment" },
      onScanFailure: () => void,
    ) => {
      const runStart = instance.start(
        cameraIdOrConfig,
        scannerConfig,
        (text) => void handleDecoded(text),
        onScanFailure,
      );
      activeStart = runStart.then(
        () => undefined,
        () => undefined,
      );
      await runStart;
    };

    const startCamera = async () => {
      setScanStatus({ type: "idle", message: "" });
      setShowLookingHint(false);
      failureStartedAtRef.current = null;
      setCameraPhase("starting");

      // Absorb React Strict Mode's immediate remount before touching the camera.
      await wait(75);
      if (cancelled) return;

      try {
        if (!window.isSecureContext) {
          setCameraPhase("idle");
          setScanStatus({
            type: "error",
            message:
              "Camera needs HTTPS. Open this page via an https:// tunnel URL (ngrok), not http://.",
          });
          return;
        }

        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
          "html5-qrcode"
        );
        if (cancelled) return;

        await stopScannerSafely(scannerRef.current);
        scannerRef.current = null;
        if (cancelled) return;

        const onScanFailure = () => {
          if (isProcessingRef.current) return;
          if (failureStartedAtRef.current === null) {
            failureStartedAtRef.current = Date.now();
          }
          if (
            Date.now() - failureStartedAtRef.current >=
            LOOKING_HINT_AFTER_MS
          ) {
            setShowLookingHint(true);
          }
        };

        let instance = createInstance(Html5Qrcode, Html5QrcodeSupportedFormats);

        try {
          await startInstance(instance, FACING_MODE_ENVIRONMENT, onScanFailure);
        } catch (firstError) {
          if (cancelled) return;

          // A failed start can leave the instance mid-transition; never reuse it.
          await stopScannerSafely(instance);
          if (scannerRef.current === instance) {
            scannerRef.current = null;
          }
          if (cancelled) return;

          const devices = await Html5Qrcode.getCameras();
          if (cancelled) return;

          if (!devices.length) {
            throw firstError instanceof Error
              ? firstError
              : new Error(getErrorMessage(firstError) || "No camera found.");
          }

          instance = createInstance(Html5Qrcode, Html5QrcodeSupportedFormats);
          await startInstance(
            instance,
            pickRearCameraId(devices),
            onScanFailure,
          );
        }

        if (cancelled) {
          await stopScannerSafely(instance);
          if (scannerRef.current === instance) {
            scannerRef.current = null;
          }
          return;
        }

        setCameraPhase("scanning");
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to start camera:", error);
        await stopScannerSafely(scannerRef.current);
        scannerRef.current = null;
        emptyScannerContainer(containerId);

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
            "Could not start the camera. Grant permission and try again.",
        });
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      void (async () => {
        if (activeStart) {
          await activeStart;
        }
        await stopScannerSafely(scannerRef.current);
        scannerRef.current = null;
        emptyScannerContainer(containerId);
      })();
    };
  }, [containerId, handleDecoded]);

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

  const statusHint = showStatusBanner ? (
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
    <p
      role="status"
      aria-live="polite"
      className="text-center text-sm text-muted-foreground"
    >
      {showLookingHint
        ? "Still looking… hold steady, fill the frame, reduce glare."
        : "Point at the visitor QR code."}
    </p>
  ) : null;

  return (
    <div className="space-y-3">
      {statusHint}

      <div
        id={containerId}
        className="min-h-[260px] w-full overflow-hidden rounded-lg bg-neutral-900 sm:min-h-[220px] [&_video]:max-h-[50dvh] [&_video]:w-full sm:[&_video]:max-h-[220px]"
      />
    </div>
  );
};
