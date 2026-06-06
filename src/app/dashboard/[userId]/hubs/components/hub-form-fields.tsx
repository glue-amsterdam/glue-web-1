"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type HubFormFieldValues = {
  name: string;
  description: string;
  display_number: string | null;
};

type HubFormFieldsProps = {
  values: HubFormFieldValues;
  onChange: (values: HubFormFieldValues) => void;
  hubId?: string;
  isMod?: boolean;
};

const fieldClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black w-full min-w-0";

export const HubFormFields = ({
  values,
  onChange,
  hubId,
  isMod = true,
}: HubFormFieldsProps) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [lastCheckedValue, setLastCheckedValue] = useState("");

  const handleChange = (
    field: keyof HubFormFieldValues,
    value: string | null
  ) => {
    onChange({ ...values, [field]: value });
  };

  useEffect(() => {
    if (!isMod || !values.display_number || values.display_number === lastCheckedValue) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        const response = await fetch("/api/check-display-number", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayNumber: values.display_number,
            entityType: "hub",
            entityId: hubId,
          }),
        });

        if (response.ok) {
          const { isAvailable: available } = await response.json();
          setIsAvailable(available);
          setLastCheckedValue(values.display_number ?? "");

          if (!available) {
            toast({
              title: "Display Number Taken",
              description: `The display number "${values.display_number}" is already in use.`,
              variant: "destructive",
            });
          }
        } else {
          setIsAvailable(null);
        }
      } catch (error) {
        console.error("Error checking display number:", error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [values.display_number, lastCheckedValue, isMod, hubId, toast]);

  const displayNumberBorderClass =
    isAvailable === false
      ? "border-red-500"
      : isAvailable === true
        ? "border-green-500"
        : "border-gray-300";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-6">
      <div className="min-w-0">
        <label htmlFor="hub-name" className="text-xs font-medium block mb-1">
          Name
        </label>
        <input
          id="hub-name"
          type="text"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Hub name"
          className={fieldClass}
          required
        />
      </div>
      <div className="min-w-0 md:col-span-2">
        <label
          htmlFor="hub-description"
          className="text-xs font-medium block mb-1"
        >
          Description
        </label>
        <textarea
          id="hub-description"
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Optional description"
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      </div>
      {isMod && (
        <div className="min-w-0 md:col-span-2">
          <label
            htmlFor="hub-display-number"
            className="text-xs font-medium block mb-1"
          >
            Display Number
          </label>
          <div className="relative max-w-xs">
            <input
              id="hub-display-number"
              type="text"
              maxLength={10}
              value={values.display_number ?? ""}
              onChange={(e) =>
                handleChange("display_number", e.target.value || null)
              }
              placeholder="e.g., 1A, 2B, 3"
              className={`${fieldClass} pr-10 ${displayNumberBorderClass}`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              {isChecking && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              {!isChecking && isAvailable === true && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {!isChecking && isAvailable === false && (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Optional. Map identifier (e.g. 1A, 2B). Must be unique.
          </p>
        </div>
      )}
    </div>
  );
};
