"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";

interface DisplayNumberFieldProps {
  isMod: boolean;
  targetUserId?: string;
}

export function DisplayNumberField({
  isMod,
  targetUserId,
}: DisplayNumberFieldProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ParticipantDetails>();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [lastCheckedValue, setLastCheckedValue] = useState<string>("");
  const { toast } = useToast();

  const displayNumber = watch("display_number");

  // Check availability when display number changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!displayNumber || displayNumber === lastCheckedValue || !isMod) {
        return;
      }

      // Debounce the check (increased to 800ms for better UX)
      const timeoutId = setTimeout(async () => {
        setIsChecking(true);
        try {
          const response = await fetch("/api/check-display-number", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              displayNumber,
              entityType: "participant",
              entityId: targetUserId,
            }),
          });

          if (response.ok) {
            const { isAvailable: available } = await response.json();
            setIsAvailable(available);
            setLastCheckedValue(displayNumber);

            if (!available) {
              toast({
                title: "Display Number Taken",
                description: `The display number "${displayNumber}" is already in use.`,
                variant: "destructive",
              });
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("Failed to check display number availability:", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
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
    };

    checkAvailability();
  }, [displayNumber, lastCheckedValue, isMod, targetUserId, toast]);

  if (!isMod) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="display_number">Display Number</Label>
      <div className="relative">
        <Input
          id="display_number"
          placeholder="e.g., 1A, 2B, 3"
          maxLength={10}
          {...register("display_number")}
          className={`pr-20 ${
            isAvailable === false
              ? "border-red-500"
              : isAvailable === true
              ? "border-green-500"
              : ""
          }`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
      {errors.display_number && (
        <p className="text-sm text-red-500">{errors.display_number.message}</p>
      )}
      <p className="text-xs text-gray-500">
        Optional. Used to display a number-letter identifier on the map (e.g.,
        1A, 2B, 3). Must be unique across all participants and hubs.
      </p>
    </div>
  );
}
