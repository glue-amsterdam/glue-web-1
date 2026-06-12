"use client";

import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  yearlySectionHeaderSchema,
  type YearlySectionHeader,
} from "@/schemas/yearly-section-header-schema";
import { YearlySectionHeaderFields } from "./YearlySectionHeaderFields";

type CitizensYearHeaderFormProps = {
  year: number;
  onSaved?: () => void;
};

export const CitizensYearHeaderForm = ({
  year,
  onSaved,
}: CitizensYearHeaderFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<YearlySectionHeader>({
    resolver: zodResolver(yearlySectionHeaderSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { handleSubmit, reset } = methods;

  const loadMeta = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/about/citizens/${year}/meta`);
      if (!res.ok) {
        throw new Error("Failed to load section header");
      }

      const data = (await res.json()) as YearlySectionHeader;
      reset({
        title: data.title ?? "",
        description: data.description ?? "",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to load citizens section header.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [reset, toast, year]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const onSubmit = async (data: YearlySectionHeader) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/about/citizens/${year}/meta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save section header");
      }

      toast({
        title: "Section header saved",
        description: `Citizens header for ${year} updated.`,
      });
      onSaved?.();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save citizens section header.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading section header...</p>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <YearlySectionHeaderFields />
        <div className="flex justify-start">
          <SaveChangesButton
            isSubmitting={isSubmitting}
            watchFields={["title", "description"]}
          />
        </div>
      </form>
    </FormProvider>
  );
};
