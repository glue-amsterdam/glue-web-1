"use client";

import { useCallback, useEffect, useState } from "react";
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
import { YEAR_NUMBER_LABELS } from "@/lib/year-numbers/year-number-labels";
import { Plus, Trash2 } from "lucide-react";

const yearFormSchema = z.object({
  year: z.coerce.number().int(),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

type YearFormData = z.infer<typeof yearFormSchema>;

const YearNumbersManager = () => {
  const { toast } = useToast();
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [showNewYearInput, setShowNewYearInput] = useState(false);

  const form = useForm<YearFormData>({
    resolver: zodResolver(yearFormSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      items: YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
    },
  });

  const loadYears = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/year-numbers");
      if (res.ok) {
        const data = await res.json();
        setYears(data.years ?? []);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load years.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  const loadYearIntoForm = async (year: number) => {
    const res = await fetch(`/api/admin/year-numbers/${year}`);
    if (!res.ok) {
      return;
    }

    const data = await res.json();
    setSelectedYear(year);
    form.reset({
      year,
      items:
        data.items?.length > 0
          ? data.items.map((item: { label: string; value: string }) => ({
              label: item.label,
              value: item.value,
            }))
          : YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
    });
  };

  const handleCreateYear = async () => {
    const year = Number(newYearInput);
    if (!Number.isFinite(year)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/year-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          items: YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
        }),
      });

      if (!res.ok) {
        throw new Error("Create failed");
      }

      toast({ title: "Year created", description: `Year numbers for ${year} created.` });
      setShowNewYearInput(false);
      setNewYearInput("");
      await loadYears();
      await loadYearIntoForm(year);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create year numbers",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (data: YearFormData) => {
    if (!selectedYear) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/year-numbers/${selectedYear}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: data.items }),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      toast({
        title: "Saved",
        description: `Year numbers for ${selectedYear} updated.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update year numbers",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteYear = async (year: number) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/year-numbers/${year}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      toast({ title: "Deleted", description: `Year numbers for ${year} deleted.` });
      setSelectedYear(null);
      form.reset({
        year: new Date().getFullYear(),
        items: YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
      });
      await loadYears();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete year numbers",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        {years.map((year) => (
          <Button
            key={year}
            type="button"
            variant={selectedYear === year ? "default" : "outline"}
            onClick={() => loadYearIntoForm(year)}
          >
            {year}
          </Button>
        ))}

        {showNewYearInput ? (
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              placeholder="Year"
              className="w-24"
              aria-label="New year"
            />
            <Button type="button" onClick={handleCreateYear} disabled={isSubmitting}>
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowNewYearInput(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowNewYearInput(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            New year
          </Button>
        )}
      </div>

      {selectedYear ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="space-y-4 border p-4 rounded-md"
          >
            <h3 className="font-medium">Year {selectedYear}</h3>

            {form.watch("items").map((_, index) => (
              <div key={form.watch(`items.${index}.label`)} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.label`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 60+" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <div className="flex gap-2">
              <SaveChangesButton
                isSubmitting={isSubmitting}
                label="Save year numbers"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDeleteYear(selectedYear)}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <p className="text-sm text-gray-600">
          Select a year or create new year numbers (Spaces, Exhibitors, Sticky, Visitors).
        </p>
      )}
    </div>
  );
};

export default YearNumbersManager;
