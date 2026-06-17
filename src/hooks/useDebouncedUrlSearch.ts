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

  onCommitRef.current = onCommit;

  const commitValue = useCallback((value: string) => {
    const normalized = value.trim();
    if (normalized === committedRef.current.trim()) return;

    pendingCommitValueRef.current = normalized;
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
    const normalizedUrl = urlValue.trim();
    const normalizedCommitted = committedRef.current.trim();

    if (normalizedUrl === normalizedCommitted) {
      pendingCommitValueRef.current = null;
      return;
    }

    if (debounceTimeoutRef.current !== null) return;

    if (pendingCommitValueRef.current !== null) {
      if (normalizedUrl !== pendingCommitValueRef.current) return;
      pendingCommitValueRef.current = null;
    }

    if (inputValue.trim() !== normalizedUrl && inputValue.trim() !== "") {
      return;
    }

    committedRef.current = normalizedUrl;
    setInputValue(urlValue);
  }, [urlValue, inputValue]);

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
