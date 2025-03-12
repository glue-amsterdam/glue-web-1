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

export function SlugField() {
  const { control, setError, clearErrors } =
    useFormContext<ParticipantDetails>();
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugUnique, setIsSlugUnique] = useState<boolean | null>(null);

  const checkSlugUniqueness = useDebouncedCallback(async (slug: string) => {
    if (!slug) {
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
        <FormItem>
          <FormLabel>Slug</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                className="bg-white text-black pr-10"
                onChange={(e) => {
                  field.onChange(e);
                  checkSlugUniqueness(e.target.value);
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
