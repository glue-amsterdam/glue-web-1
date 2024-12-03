import React, { useEffect, useState } from "react";
import { useFormContext, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CitizensSection } from "@/schemas/citizenSchema";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MainInfoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useFormContext<CitizensSection>();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: initialData } = useSWR<CitizensSection>(
    "/api/admin/about/citizens",
    fetcher
  );

  const watchedFields = watch(["title", "description"]);

  useEffect(() => {
    if (initialData) {
      const hasChanged =
        watchedFields[0] !== initialData.title ||
        watchedFields[1] !== initialData.description;
      setHasChanges(hasChanged);
    }
  }, [watchedFields, initialData]);

  const onSubmit = async (data: FieldValues) => {
    try {
      const mainInfo = {
        title: data.title as string,
        description: data.description as string,
      };

      const response = await fetch("/api/admin/about/citizens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mainInfo),
      });

      if (!response.ok) throw new Error("Failed to update main info");

      await mutate("/api/admin/about/citizens");

      toast({
        title: "Citizens headers updated",
        description: "The citizens headers has been successfully updated.",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("citizens headers submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update citizens headers. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} className="mt-1 bg-white" />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          className="mt-1"
          rows={4}
        />
        {errors.description && (
          <p className="text-red-500">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" disabled={!hasChanges}>
        Save headers
      </Button>
    </form>
  );
}
