"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Availability = {
  citizens: { available: boolean; count: number };
  sticky: { available: boolean; count: number };
  year_numbers: { configured: boolean };
};

const yearFormSchema = z.object({
  year: z.coerce.number().int(),
  media_type: z.enum(["video", "image"]).nullable(),
  video_src: z.string().optional(),
  video_poster: z.string().optional(),
  video_alt: z.string().optional(),
  image_src: z.string().optional(),
  image_alt: z.string().optional(),
  text_title: z.string(),
  text_description: z.string(),
});

type YearFormData = z.infer<typeof yearFormSchema>;

export default function AboutArchiveForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [existingYears, setExistingYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const form = useForm<YearFormData>({
    resolver: zodResolver(yearFormSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      media_type: null,
      text_title: "",
      text_description: "",
    },
  });

  const loadYears = async () => {
    const res = await fetch("/api/admin/about/archive/years");
    const data = await res.json();
    setExistingYears((data.years ?? []).map((y: { year: number }) => y.year));
  };

  useEffect(() => {
    loadYears();
  }, []);

  const checkAvailability = async (year: number) => {
    const res = await fetch(`/api/admin/about/archive/availability?year=${year}`);
    const data = await res.json();
    setAvailability(data);
  };

  const watchedYear = form.watch("year");

  useEffect(() => {
    if (watchedYear) {
      checkAvailability(watchedYear);
    }
  }, [watchedYear]);

  const handleCreateYear = async (data: YearFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/about/archive/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Create failed");
      }
      toast({ title: "Year created", description: `Archive ${data.year} created.` });
      await loadYears();
      setSelectedYear(data.year);
    } catch {
      toast({ title: "Error", description: "Failed to create year", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateYear = async (data: YearFormData) => {
    if (!selectedYear) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/about/archive/years/${selectedYear}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Update failed");
      }
      toast({ title: "Year updated", description: `Archive ${selectedYear} updated.` });
    } catch {
      toast({ title: "Error", description: "Failed to update year", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadYearIntoForm = async (year: number) => {
    const res = await fetch("/api/admin/about/archive/years");
    const data = await res.json();
    const yearRow = (data.years ?? []).find((y: { year: number }) => y.year === year);
    if (!yearRow) {
      return;
    }
    setSelectedYear(year);
    form.reset({
      year: yearRow.year,
      media_type: yearRow.media_type,
      video_src: yearRow.video_src ?? "",
      video_poster: yearRow.video_poster ?? "",
      video_alt: yearRow.video_alt ?? "",
      image_src: yearRow.image_src ?? "",
      image_alt: yearRow.image_alt ?? "",
      text_title: yearRow.text_title ?? "",
      text_description: yearRow.text_description ?? "",
    });
    checkAvailability(year);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Archive</h2>

      {existingYears.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {existingYears.map((year) => {
            const isActive = selectedYear === year;

            return (
              <Button
                key={year}
                type="button"
                variant="outline"
                className={cn(
                  isActive &&
                    "border-(--primary-color) bg-(--primary-color) text-(--white-color) hover:bg-(--primary-color) hover:text-(--white-color)"
                )}
                onClick={() => loadYearIntoForm(year)}
              >
                {year}
              </Button>
            );
          })}
        </div>
      ) : null}

      {availability ? (
        <div className="space-y-1 text-sm">
          <p>
            Citizens:{" "}
            {availability.citizens.available
              ? `✓ ${availability.citizens.count} available`
              : "✗ Not available for this year"}
          </p>
          <p>
            Sticky:{" "}
            {availability.sticky.available
              ? `✓ ${availability.sticky.count} participants available`
              : "✗ Not available for this year"}
          </p>
          <p>
            Year numbers:{" "}
            {availability.year_numbers.configured ? (
              "✓ configured"
            ) : (
              <>
                ✗ not configured —{" "}
                <Link
                  href="/admin/year-numbers"
                  className="text-blue-600 underline"
                >
                  manage year numbers
                </Link>
              </>
            )}
          </p>
        </div>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            selectedYear ? handleUpdateYear : handleCreateYear
          )}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input {...field} type="number" disabled={selectedYear != null} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="media_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media Type</FormLabel>
                <FormControl>
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : (e.target.value as "video" | "image")
                      )
                    }
                  >
                    <option value="">None</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="video_src"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video URL (placeholder)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="/videos/glue-2025.mp4" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_src"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (placeholder)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="/images/glue-2025.jpg" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="text_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="text_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
              </FormItem>
            )}
          />

          <SaveChangesButton
            isSubmitting={isSubmitting}
            className="w-full"
            label={selectedYear ? "Update Year" : "Create Year"}
          />
        </form>
      </Form>
    </div>
  );
}
