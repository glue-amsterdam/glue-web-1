"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import {
  pressKitLinksFormSchema,
  pressKitLinkSchema,
} from "@/schemas/mainSchema";
import { mutate } from "swr";
import { createSubmitHandler } from "@/utils/form-helpers";

interface MainPressKitFormProps {
  initialData: {
    pressKitLinks?: { id: number; link: string; description?: string | null }[];
  };
}

export default function MainPressKitForm({
  initialData,
}: MainPressKitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<{
    pressKitLinks: { id: number; link: string; description?: string | null }[];
  }>({
    resolver: zodResolver(pressKitLinksFormSchema),
    defaultValues: { pressKitLinks: initialData.pressKitLinks || [] },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
    getValues,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pressKitLinks",
  });

  const onSubmit = createSubmitHandler<{
    pressKitLinks: { id: number; link: string; description?: string | null }[];
  }>(
    "/api/admin/main/press_kit_links",
    async (data) => {
      console.log("Form submitted successfully", data);
      toast({
        title: "Press kit links updated",
        description: "The press kit links have been successfully updated.",
      });
      reset(data);
      await mutate("/api/admin/main/press_kit_links");
      router.refresh();
    },
    (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update press kit links. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: {
    pressKitLinks: { id: number; link: string; description?: string | null }[];
  }) => {
    console.log("handleFormSubmit called with data:", data);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = async () => {
    setIsAdding(true);
    try {
      const newLink = {
        link: "",
        description: "",
      };

      const response = await fetch("/api/admin/main/press_kit_links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLink),
      });

      if (!response.ok) {
        throw new Error("Failed to create new press kit link");
      }

      const newItem = await response.json();
      append(newItem);

      toast({
        title: "New link added",
        description: "A new press kit link has been added.",
      });
    } catch (error) {
      console.error("Error adding new press kit link:", error);
      toast({
        title: "Error",
        description: "Failed to add new press kit link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (index: number, id: number) => {
    try {
      const response = await fetch(`/api/admin/main/press_kit_links?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete response error:", errorData);
        throw new Error("Failed to delete press kit link");
      }

      remove(index);

      toast({
        title: "Link deleted",
        description: "The press kit link has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting press kit link:", error);
      toast({
        title: "Error",
        description: "Failed to delete press kit link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Press Kit Links</h2>
          <Button
            type="button"
            onClick={handleAddNew}
            disabled={isAdding}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{isAdding ? "Adding..." : "Add Link"}</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                No press kit links available. Click "Add Link" to create your
                first link.
              </p>
            </div>
          ) : (
            fields.map((field, index) => {
              const currentValues = getValues();
              const actualId = currentValues.pressKitLinks[index]?.id;
              return (
                <div key={field.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Link URL</label>
                        <Input
                          {...register(`pressKitLinks.${index}.link`)}
                          placeholder="https://example.com"
                          className="dashboard-input"
                        />
                        {errors.pressKitLinks?.[index]?.link && (
                          <p className="text-red-500 text-sm">
                            {errors.pressKitLinks[index]?.link?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Description (optional)
                        </label>
                        <Input
                          {...register(`pressKitLinks.${index}.description`)}
                          placeholder="Brief description of the link"
                          className="dashboard-input"
                        />
                        {errors.pressKitLinks?.[index]?.description && (
                          <p className="text-red-500 text-sm">
                            {errors.pressKitLinks[index]?.description?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(index, actualId)}
                      className="ml-4 flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {fields.length > 0 && (
            <SaveChangesButton
              isSubmitting={isSubmitting}
              className="w-full"
              watchFields={["pressKitLinks"]}
            />
          )}
        </form>
      </div>
    </FormProvider>
  );
}
