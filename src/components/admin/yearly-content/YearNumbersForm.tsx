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
import { devLog } from "@/lib/dev-log";
import { Trash2 } from "lucide-react";

const LOG_SCOPE = "year-numbers-form";

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
  const [debugInfo, setDebugInfo] = useState<string>("");

  const existsInDbRef = useRef(existsInDb);

  useEffect(() => {
    existsInDbRef.current = existsInDb;
  }, [existsInDb]);

  const form = useForm<YearFormData>({
    resolver: zodResolver(yearFormSchema),
    defaultValues: {
      year,
      items: YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
    },
  });

  const loadYear = useCallback(async () => {
    devLog(LOG_SCOPE, "loadYear:start", { year });
    setIsLoading(true);
    setExistsInDb(false);
    existsInDbRef.current = false;

    try {
      const url = `/api/admin/year-numbers/${year}`;
      const res = await fetch(url);
      const data = await parseApiErrorBody(res);

      devLog(LOG_SCOPE, "loadYear:response", {
        year,
        url,
        status: res.status,
        ok: res.ok,
        data,
      });

      if (res.ok && data) {
        const configured = data.configured === true;
        setExistsInDb(configured);
        existsInDbRef.current = configured;
        setDebugInfo(
          `load ok · configured=${String(configured)} · items=${data.items?.length ?? 0}`
        );

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
      setDebugInfo(`load failed · status=${res.status}`);
      form.reset({
        year,
        items: YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
      });
    } catch (error) {
      devLog(LOG_SCOPE, "loadYear:error", { year, error });
      setDebugInfo(`load error · ${String(error)}`);
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
    devLog(LOG_SCOPE, "handleCreate:start", { year, items: data.items });
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/year-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, items: data.items }),
      });
      const body = await parseApiErrorBody(res);

      devLog(LOG_SCOPE, "handleCreate:response", {
        year,
        status: res.status,
        ok: res.ok,
        body,
      });

      if (!res.ok) {
        setDebugInfo(`create failed · status=${res.status} · ${JSON.stringify(body)}`);
        throw new Error(
          typeof body?.error === "string" ? body.error : "Create failed"
        );
      }

      setDebugInfo("create ok");
      toast({
        title: "Created",
        description: `Year numbers for ${year} created.`,
      });
      setExistsInDb(true);
      existsInDbRef.current = true;
      onSaved?.();
    } catch (error) {
      devLog(LOG_SCOPE, "handleCreate:error", { year, error });
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
    devLog(LOG_SCOPE, "handleSave:start", { year, items: data.items });
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/year-numbers/${year}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: data.items }),
      });
      const body = await parseApiErrorBody(res);

      devLog(LOG_SCOPE, "handleSave:response", {
        year,
        status: res.status,
        ok: res.ok,
        body,
      });

      if (res.status === 404) {
        devLog(LOG_SCOPE, "handleSave:fallback-to-create", { year });
        setDebugInfo("put 404 · falling back to create");
        setExistsInDb(false);
        existsInDbRef.current = false;
        setIsSubmitting(false);
        await handleCreate(data);
        return;
      }

      if (!res.ok) {
        setDebugInfo(`save failed · status=${res.status} · ${JSON.stringify(body)}`);
        throw new Error(
          typeof body?.error === "string" ? body.error : "Update failed"
        );
      }

      setDebugInfo("save ok");
      toast({
        title: "Saved",
        description: `Year numbers for ${year} updated.`,
      });
      onSaved?.();
    } catch (error) {
      devLog(LOG_SCOPE, "handleSave:error", { year, error });
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

  const handleSubmit = (data: YearFormData) => {
    const mode = existsInDbRef.current ? "PUT" : "POST";
    devLog(LOG_SCOPE, "handleSubmit", {
      year,
      mode,
      existsInDbRef: existsInDbRef.current,
      existsInDbState: existsInDb,
    });
    setDebugInfo(`submit · mode=${mode}`);

    if (existsInDbRef.current) {
      return handleSave(data);
    }

    return handleCreate(data);
  };

  const handleDelete = async () => {
    devLog(LOG_SCOPE, "handleDelete:start", { year });
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/year-numbers/${year}`, {
        method: "DELETE",
      });
      const body = await parseApiErrorBody(res);

      devLog(LOG_SCOPE, "handleDelete:response", {
        year,
        status: res.status,
        body,
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      toast({
        title: "Deleted",
        description: `Year numbers for ${year} deleted.`,
      });
      setExistsInDb(false);
      existsInDbRef.current = false;
      setDebugInfo("delete ok");
      form.reset({
        year,
        items: YEAR_NUMBER_LABELS.map((label) => ({ label, value: "" })),
      });
      onDeleted?.();
    } catch (error) {
      devLog(LOG_SCOPE, "handleDelete:error", { year, error });
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
      {process.env.NODE_ENV === "development" ? (
        <pre
          aria-label="Year numbers debug info"
          className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950 overflow-x-auto"
        >
          {`dev · year=${year} · existsInDb=${String(existsInDb)} · ${debugInfo || "idle"}`}
        </pre>
      ) : null}

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
