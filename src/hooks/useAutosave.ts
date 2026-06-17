"use client";

import { useCallback, useEffect, useRef } from "react";

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type UseAutosaveOptions<T> = {
  data: T;
  isDirty: boolean;
  intervalMs?: number;
  enabled?: boolean;
  onSave: (data: T) => Promise<void>;
  onStatusChange?: (status: AutosaveStatus, savedAt: Date | null) => void;
};

export const useAutosave = <T>({
  data,
  isDirty,
  intervalMs = 15000,
  enabled = true,
  onSave,
  onStatusChange,
}: UseAutosaveOptions<T>) => {
  const dataRef = useRef(data);
  const isDirtyRef = useRef(isDirty);
  const isSavingRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const runSave = useCallback(async () => {
    if (!enabled || !isDirtyRef.current || isSavingRef.current) {
      return;
    }

    const snapshot = JSON.stringify(dataRef.current);
    if (snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    isSavingRef.current = true;
    onStatusChange?.("saving", null);

    try {
      await onSave(dataRef.current);
      lastSavedSnapshotRef.current = snapshot;
      onStatusChange?.("saved", new Date());
    } catch {
      onStatusChange?.("error", null);
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, onSave, onStatusChange]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void runSave();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs, runSave]);

  const saveNow = useCallback(async () => {
    await runSave();
  }, [runSave]);

  const markSaved = useCallback((snapshotData?: T) => {
    const snapshot = JSON.stringify(snapshotData ?? dataRef.current);
    lastSavedSnapshotRef.current = snapshot;
    onStatusChange?.("saved", new Date());
  }, [onStatusChange]);

  return { saveNow, markSaved };
};
