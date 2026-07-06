"use client";

import { useEffect, useState } from "react";
import { TermsContent } from "@/components/terms-content";

type ParticipateTermsAcceptanceProps = {
  termsContent: string;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  error?: string;
  checkboxId?: string;
};

export const ParticipateTermsAcceptance = ({
  termsContent,
  accepted,
  onAcceptedChange,
  error,
  checkboxId = "termsAccepted",
}: ParticipateTermsAcceptanceProps) => {
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isTermsDialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTermsDialogOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isTermsDialogOpen]);

  const handleOpenTerms = () => {
    setIsTermsDialogOpen(true);
  };

  const handleCloseTerms = () => {
    setIsTermsDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-[5px]">
        <div className="flex gap-[5px]">
          <input
            type="checkbox"
            id={checkboxId}
            checked={accepted}
            onChange={(event) => onAcceptedChange(event.target.checked)}
            className="size-[15px] border border-(--black-color) accent-(--primary-color) checked:accent-(--primary-color)"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${checkboxId}-error` : undefined}
          />
          <label htmlFor={checkboxId} className="cursor-pointer body-text">
            I accept the{" "}
            <button
              type="button"
              onClick={handleOpenTerms}
              className="text-(--primary-color) underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              tabIndex={0}
              aria-label="Open General terms and conditions"
            >
              General terms and conditions
            </button>
          </label>
        </div>

        {error ? (
          <p
            id={`${checkboxId}-error`}
            role="alert"
            className="text-[12px] leading-[14px] text-(--primary-color)"
          >
            {error}
          </p>
        ) : null}
      </div>

      {isTermsDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-dialog-title"
          aria-describedby="terms-dialog-description"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={handleCloseTerms}
            aria-label="Close terms and conditions"
            tabIndex={-1}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-(--white-color) border border-(--black-color) p-4">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={handleCloseTerms}
                className="cursor-pointer p-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                aria-label="Close"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M2.00007 0.999993L11.1925 10.1924" stroke="black" />
                  <path d="M2 10.1914L11.1924 0.999019" stroke="black" />
                </svg>
              </button>
            </div>
            <h2 id="terms-dialog-title" className="sr-only">
              General Terms and Conditions
            </h2>
            <p id="terms-dialog-description" className="sr-only">
              Please read the following terms and conditions carefully.
            </p>
            <TermsContent content={termsContent} />
          </div>
        </div>
      ) : null}
    </>
  );
};

export const TERMS_ACCEPTANCE_ERROR =
  "You must accept the General terms and conditions";
