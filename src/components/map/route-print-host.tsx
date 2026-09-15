"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RoutePrintDocument } from "@/components/map/route-print-document";
import type { RoutePrintProps } from "@/lib/map/route-print-props";

type RoutePrintHostProps = {
  printProps: RoutePrintProps | null;
  onPrintComplete: () => void;
};

const waitForImages = (root: HTMLElement): Promise<void> => {
  const images = Array.from(root.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();

  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          const handleDone = () => {
            img.removeEventListener("load", handleDone);
            img.removeEventListener("error", handleDone);
            resolve();
          };
          img.addEventListener("load", handleDone);
          img.addEventListener("error", handleDone);
        })
    )
  ).then(() => undefined);
};

/**
 * Portals a print-only route sheet and triggers the browser print dialog.
 */
export const RoutePrintHost = ({
  printProps,
  onPrintComplete,
}: RoutePrintHostProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const onPrintCompleteRef = useRef(onPrintComplete);
  onPrintCompleteRef.current = onPrintComplete;

  useEffect(() => {
    if (!printProps) return;

    const previousTitle = document.title;
    document.title = printProps.routeName;

    let cancelled = false;

    const handleAfterPrint = () => {
      document.title = previousTitle;
      onPrintCompleteRef.current();
    };

    window.addEventListener("afterprint", handleAfterPrint);

    const runPrint = async () => {
      const root = rootRef.current;
      if (root) {
        await waitForImages(root);
      }
      if (cancelled) return;
      window.print();
    };

    void runPrint();

    return () => {
      cancelled = true;
      window.removeEventListener("afterprint", handleAfterPrint);
      document.title = previousTitle;
    };
  }, [printProps]);

  if (!printProps || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      data-route-print-root=""
      className="pointer-events-none fixed top-0 left-0 z-9999 hidden print:block"
      aria-hidden={!printProps}
    >
      <RoutePrintDocument {...printProps} />
    </div>,
    document.body
  );
};
