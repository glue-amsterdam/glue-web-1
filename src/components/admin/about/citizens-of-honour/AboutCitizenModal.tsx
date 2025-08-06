"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { citizenSchema, type Citizen } from "@/schemas/citizenSchema";
import { uploadImage, deleteImage } from "@/utils/supabase/storage/client";
import { generateAltText } from "@/lib/utils";
import { config } from "@/env";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/app/components/editor";
import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AboutCitizenModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: string;
  citizen?: Citizen | null;
  onCitizenSaved: () => void;
}

const EMPTY_CITIZEN: Omit<Citizen, "id"> = {
  name: "",
  image_url: "",
  image_name: "",
  description: "",
  section_id: "about-citizens-section",
  year: "",
};

export function AboutCitizenModal({
  isOpen,
  onClose,
  selectedYear,
  citizen,
  onCitizenSaved,
}: AboutCitizenModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<Omit<Citizen, "id">>({
    resolver: zodResolver(citizenSchema.omit({ id: true })),
    defaultValues: citizen || { ...EMPTY_CITIZEN, year: selectedYear },
  });

  const { handleSubmit, reset, setValue, watch } = form;
  const imageUrl = watch("image_url");

  useEffect(() => {
    if (isOpen) {
      reset(citizen || { ...EMPTY_CITIZEN, year: selectedYear });
      setSelectedFile(null);
      setImagePreview(null);
    }
  }, [isOpen, citizen, selectedYear, reset]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for later upload
    setSelectedFile(file);
    setValue("image_name", file.name);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: Omit<Citizen, "id">) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = data.image_url;

      // Upload new image if selected
      if (selectedFile) {
        console.log("Uploading image during submit...");
        const { imageUrl, error } = await uploadImage({
          file: selectedFile,
          bucket: config.bucketName,
          folder: `about/citizens/${selectedYear}`,
          maxSizeMB: 2,
        });

        if (error) {
          console.error("Upload error:", error);
          toast({
            title: "Upload failed",
            description: error,
            variant: "destructive",
          });
          return;
        }

        finalImageUrl = imageUrl;
        console.log("Image uploaded successfully:", imageUrl);
      }

      // If updating an existing citizen and the image has changed, delete the old image
      if (citizen && citizen.image_url && citizen.image_url !== finalImageUrl) {
        try {
          await deleteImage(citizen.image_url);
        } catch (error) {
          console.error("Error deleting old image:", error);
          // Continue with the update even if image deletion fails
        }
      }

      const url = citizen
        ? `/api/admin/about/citizens/${selectedYear}/${citizen.id}`
        : `/api/admin/about/citizens/${selectedYear}`;

      const method = citizen ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          image_url: finalImageUrl,
          ...(citizen && { id: citizen.id }), // Only include ID for updates
          year: selectedYear,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${citizen ? "update" : "create"} citizen`);
      }

      await response.json();

      toast({
        title: `Citizen ${citizen ? "updated" : "created"}`,
        description: `Citizen ${
          citizen ? "updated" : "created"
        } successfully for year ${selectedYear}`,
      });

      onCitizenSaved();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Citizen submission error:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          citizen ? "update" : "create"
        } citizen. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!citizen) return;

    if (!confirm("Are you sure you want to delete this citizen?")) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/about/citizens/${selectedYear}/${citizen.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete citizen");
      }

      toast({
        title: "Citizen deleted",
        description: "Citizen deleted successfully",
      });

      onCitizenSaved();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Citizen deletion error:", error);
      toast({
        title: "Error",
        description: "Failed to delete citizen. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-black">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {citizen ? `Edit Citizen: ${citizen.name}` : "Add New Citizen"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Citizen Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter citizen name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={() => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="w-full h-48 relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        {imagePreview || imageUrl ? (
                          <Image
                            src={(imagePreview || imageUrl) as string}
                            alt={generateAltText(
                              selectedYear,
                              form.watch("name") || "Citizen"
                            )}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm">
                              No image selected
                            </p>
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                        aria-label="Upload citizen image"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={triggerFileInput}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {imagePreview || imageUrl
                          ? "Change Image"
                          : "Select Image"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? "Saving..."
                  : citizen
                  ? "Update Citizen"
                  : "Create Citizen"}
              </Button>

              {citizen && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete Citizen
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
