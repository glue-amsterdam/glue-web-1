export type CameraDeviceLike = {
  id: string;
  label: string;
};

export type QrBoxSize = {
  width: number;
  height: number;
};

/** Show “Still looking…” after this many ms of consecutive decode failures. */
export const LOOKING_HINT_AFTER_MS = 4500;

export const getAuthErrorMessage = (
  status: number,
  apiMessage: string,
): string => {
  if (status === 401) {
    return "Session expired. Sign in again, then reopen Scan.";
  }

  if (status === 403) {
    return apiMessage.trim().length > 0
      ? apiMessage
      : "You do not have permission to scan this QR code.";
  }

  return apiMessage;
};

export const pickRearCameraId = (devices: CameraDeviceLike[]): string => {
  if (devices.length === 0) {
    throw new Error("No camera devices available.");
  }

  const labeledRear = devices.find((device) =>
    /back|rear|environment|achter|trasera|traseira/i.test(device.label),
  );
  if (labeledRear) return labeledRear.id;

  // When labels are empty (common before permission), prefer the last device —
  // on many phones that is the rear camera.
  return devices[devices.length - 1]?.id ?? devices[0].id;
};

export const buildQrBox = (
  viewfinderWidth: number,
  viewfinderHeight: number,
): QrBoxSize => {
  const edge = Math.max(
    180,
    Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.8),
  );
  return { width: edge, height: edge };
};
