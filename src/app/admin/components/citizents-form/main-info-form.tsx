import React from "react";
import { useFormContext, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CitizensSection } from "@/schemas/citizenSchema";

export function MainInfoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<CitizensSection>();
  const { toast } = useToast();

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

      toast({
        title: "Main info updated",
        description: "The main info has been successfully updated.",
      });
    } catch (error) {
      console.error("Main info submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update main info. Please try again.",
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

      <Button type="submit">Save Main Info</Button>
    </form>
  );
}
