"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { Trash2 } from "lucide-react";

const yearFormSchema = z.object({
  year: z.number().int(),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

type YearFormInput = z.input<typeof yearFormSchema>;
type YearFormData = z.output<typeof yearFormSchema>;

type YearNumbersFormProps = {
  year: number;
  onSaved?: () => void;
  onDeleted?: () => void;
};

const parseApiErrorBody = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const YearNumbersForm = ({
  year,
  onSaved,
  onDeleted,
}: YearNumbersFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existsInDb, setExistsInDb] = useState(false);

  const existsInDbRef = useRef(existsInDb);

  useEffect(() => {
    existsInDbRef.current = existsInDb;
  }, [existsInDb]);

  const form = useForm<YearFormInput>({
    resolver: zodResolver(yearFormSchema),
    defaultValues: {
      year,
      items: YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
    },
  });

  const loadYear = useCallback(async () => {
    setIsLoading(true);
    setExistsInDb(false);
    existsInDbRef.current = false;

    try {
      const url = `/api/admin/year-numbers/${year}`;
      const res = await fetch(url);
      const data = await parseApiErrorBody(res);

      if (res.ok && data) {
        const configured = data.configured === true;
        setExistsInDb(configured);
        existsInDbRef.current = configured;

        form.reset({
          year,
          items:
            configured && data.items?.length > 0
              ? data.items.map((item: { label: string; value: string }) => ({
                  label: item.label,
                  value: item.value,
                }))
              : YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
        });
        return;
      }

      setExistsInDb(false);
      existsInDbRef.current = false;
      form.reset({
        year,
        items: YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to load year numbers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [year, form, toast]);

  useEffect(() => {
    loadYear();
  }, [loadYear]);

  const handleCreate = async (data: YearFormData) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/year-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, items: data.items }),
      });
      const body = await parseApiErrorBody(res);

      if (!res.ok) {
        throw new Error(
          typeof body?.error === "string" ? body.error : "Create failed"
        );
      }

      toast({
        title: "Created",
        description: `Year numbers for ${year} created.`,
      });
      onSaved?.();
      await loadYear();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create year numbers",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (data: YearFormData) => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/year-numbers/${year}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: data.items }),
      });
      const body = await parseApiErrorBody(res);

      if (res.status === 404) {
        setExistsInDb(false);
        existsInDbRef.current = false;
        setIsSubmitting(false);
        await handleCreate(data);
        return;
      }

      if (!res.ok) {
        throw new Error(
          typeof body?.error === "string" ? body.error : "Update failed"
        );
      }

      toast({
        title: "Saved",
        description: `Year numbers for ${year} updated.`,
      });
      onSaved?.();
      await loadYear();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update year numbers",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (data: YearFormInput) => {
    if (existsInDbRef.current) {
      return handleSave(data);
    }

    return handleCreate(data);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/year-numbers/${year}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      toast({
        title: "Deleted",
        description: `Year numbers for ${year} deleted.`,
      });
      onDeleted?.();
      await loadYear();
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

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading year numbers...</p>;
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {form.watch("items").map((_, index) => (
            <div
              key={form.watch(`items.${index}.label`)}
              className="flex gap-2"
            >
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
              isDirty
              label={existsInDb ? "Save year numbers" : "Create year numbers"}
            />
            {existsInDb ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            ) : null}
          </div>
        </form>
      </Form>
    </div>
  );
};
