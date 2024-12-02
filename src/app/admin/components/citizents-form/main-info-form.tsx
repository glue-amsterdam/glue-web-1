import React from "react";
import { useFormContext, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useToast } from "@/hooks/use-toast";

export function MainInfoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext();
  const { toast } = useToast();

  const onSubmitMainInfo = async (data: FieldValues) => {
    try {
      const response = await fetch("/api/admin/about/citizens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    } finally {
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitMainInfo)} className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} className="mt-1 bg-white" />
        {errors.title && (
          <p className="text-red-500">
            {errors.title.message as React.ReactNode}
          </p>
        )}
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
          <p className="text-red-500">
            {errors.description.message as React.ReactNode}
          </p>
        )}
      </div>

      <SaveChangesButton
        watchFields={["title", "description"]}
        className="w-full"
      />
    </form>
  );
}
