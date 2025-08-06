"use client";

import { useEffect, useState } from "react";

export function useSanitizedHTML(html: string) {
  const [sanitized, setSanitized] = useState("");
  useEffect(() => {
    import("dompurify").then((DOMPurify) => {
      setSanitized(DOMPurify.default.sanitize(html));
    });
  }, [html]);
  return sanitized;
}
