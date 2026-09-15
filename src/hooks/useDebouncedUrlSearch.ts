"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

type UseDebouncedUrlSearchOptions = {
  urlValue: string;
  onCommit: (value: string) => void;
  debounceMs?: number;
};

type UseDebouncedUrlSearchReturn = {
  inputValue: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

type UrlSearchSyncDecision =
  | { action: "noop" }
  | { action: "wait" }
  | { action: "clear-pending" }
  | { action: "sync"; nextInputValue: string; nextCommitted: string };

type ResolveUrlSearchSyncArgs = {
  urlValue: string;
  committedValue: string;
  pendingCommitValue: string | null;
  preCommitUrlValue: string | null;
};

/**
 * Decides how local search input should react when the URL `q` changes externally
 * (e.g. category/filter clears search). Waits only while an in-flight commit still
 * shows the pre-commit URL; any other URL change syncs immediately (including empty).
 */
export const resolveUrlSearchSync = ({
  urlValue,
  committedValue,
  pendingCommitValue,
  preCommitUrlValue,
}: ResolveUrlSearchSyncArgs): UrlSearchSyncDecision => {
  const normalizedUrl = urlValue.trim();
  const normalizedCommitted = committedValue.trim();

  if (normalizedUrl === normalizedCommitted) {
    return pendingCommitValue !== null
      ? { action: "clear-pending" }
      : { action: "noop" };
  }

  if (
    pendingCommitValue !== null &&
    preCommitUrlValue !== null &&
    normalizedUrl === preCommitUrlValue.trim()
  ) {
    return { action: "wait" };
  }

  return {
    action: "sync",
    nextInputValue: urlValue,
    nextCommitted: normalizedUrl,
  };
};

export const useDebouncedUrlSearch = ({
  urlValue,
  onCommit,
  debounceMs = 400,
}: UseDebouncedUrlSearchOptions): UseDebouncedUrlSearchReturn => {
  const [inputValue, setInputValue] = useState(urlValue);
  const onCommitRef = useRef(onCommit);
  const committedRef = useRef(urlValue);
  const debounceTimeoutRef = useRef<number | null>(null);
  const pendingCommitValueRef = useRef<string | null>(null);
  const preCommitUrlValueRef = useRef<string | null>(null);

  onCommitRef.current = onCommit;

  const commitValue = useCallback((value: string) => {
    const normalized = value.trim();
    if (normalized === committedRef.current.trim()) return;

    pendingCommitValueRef.current = normalized;
    preCommitUrlValueRef.current = committedRef.current;
    committedRef.current = normalized;
    setInputValue(normalized);
    onCommitRef.current(normalized);
  }, []);

  const clearDebounceTimeout = useCallback(() => {
    if (debounceTimeoutRef.current === null) return;
    window.clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    const decision = resolveUrlSearchSync({
      urlValue,
      committedValue: committedRef.current,
      pendingCommitValue: pendingCommitValueRef.current,
      preCommitUrlValue: preCommitUrlValueRef.current,
    });

    if (decision.action === "noop") return;

    if (decision.action === "clear-pending") {
      pendingCommitValueRef.current = null;
      preCommitUrlValueRef.current = null;
      return;
    }

    if (decision.action === "wait") return;

    clearDebounceTimeout();
    pendingCommitValueRef.current = null;
    preCommitUrlValueRef.current = null;
    committedRef.current = decision.nextCommitted;
    setInputValue(decision.nextInputValue);
  }, [clearDebounceTimeout, urlValue]);

  useEffect(() => {
    clearDebounceTimeout();

    const normalizedInput = inputValue.trim();
    const normalizedUrl = urlValue.trim();
    if (normalizedInput === normalizedUrl) return;

    debounceTimeoutRef.current = window.setTimeout(() => {
      debounceTimeoutRef.current = null;
      commitValue(inputValue);
    }, debounceMs);

    return clearDebounceTimeout;
  }, [clearDebounceTimeout, commitValue, debounceMs, inputValue, urlValue]);

  const onInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;

      clearDebounceTimeout();
      commitValue(inputValue);
    },
    [clearDebounceTimeout, commitValue, inputValue]
  );

  return { inputValue, onInputChange, onInputKeyDown };
};
