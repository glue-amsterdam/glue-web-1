"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function SlugField({ readOnly = false }: { readOnly?: boolean }) {
  const { control, setError, clearErrors } =
    useFormContext<ParticipantDetails>();
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugUnique, setIsSlugUnique] = useState<boolean | null>(null);

  const checkSlugUniqueness = useDebouncedCallback(async (slug: string) => {
    if (readOnly || !slug) {
      setIsSlugUnique(null);
      return;
    }
    setIsCheckingSlug(true);
    try {
      const response = await fetch(
        `/api/check-slug?slug=${encodeURIComponent(slug)}`
      );
      const data = await response.json();
      setIsSlugUnique(data.isUnique);
      if (!data.isUnique) {
        setError("slug", {
          type: "manual",
          message:
            "This slug is already in use. Please choose a different one.",
        });
      } else {
        clearErrors("slug");
      }
    } catch (error) {
      console.error("Error checking slug uniqueness:", error);
      setIsSlugUnique(null);
    } finally {
      setIsCheckingSlug(false);
    }
  }, 600);

  return (
    <FormField
      control={control}
      name="slug"
      render={({ field }) => (
        <FormItem className="mini-padding">
          <FormLabel>Slug (URL), example: <span className="text-xs text-gray-500">https://example.com/exhibitors/your-slug</span></FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                disabled={readOnly}
                className="bg-(--white-color) text-(--black-color) pr-10 disabled:opacity-60"
                onChange={(e) => {
                  // Remove whitespace and convert to lowercase
                  const cleanValue = e.target.value
                    .replace(/\s+/g, "")
                    .toLowerCase();
                  field.onChange(cleanValue);
                  checkSlugUniqueness(cleanValue);
                }}
                onKeyDown={(e) => {
                  // Prevent space key
                  if (e.key === " ") {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData("text");
                  const cleanValue = pastedText
                    .replace(/\s+/g, "")
                    .toLowerCase();
                  field.onChange(cleanValue);
                  checkSlugUniqueness(cleanValue);
                }}
              />
            </FormControl>
            {!isCheckingSlug && isSlugUnique && field.value && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          {isCheckingSlug && (
            <p className="text-sm text-gray-500">
              Checking slug availability...
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
