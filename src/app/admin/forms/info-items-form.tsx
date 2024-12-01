"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  InfoSectionContent,
  infoItemsSectionSchema,
  InfoItem,
} from "@/schemas/baseSchema";
import { PlusCircle, X, ImageIcon } from "lucide-react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { uploadImage } from "@/utils/supabase/storage/client";

interface InfoSectionFormProps {
  initialData: InfoSectionContent;
}

export default function InfoSectionForm({ initialData }: InfoSectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const methods = useForm<InfoSectionContent>({
    resolver: zodResolver(infoItemsSectionSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "infoItems",
  });

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      const updatedInfoItem = {
        ...fields[index],
        image: {
          id: fields[index].image.id,
          image_url: imageUrl,
          alt: "",
          image_name: file.name,
          file: file,
        },
      };

      fields[index] = updatedInfoItem;
    }
  };

  const onSubmit = async (data: InfoSectionContent) => {
    setIsSubmitting(true);
    try {
      // Upload images before submitting form data
      for (let i = 0; i < data.infoItems.length; i++) {
        const infoItem = data.infoItems[i] as InfoItem & {
          image: { file?: File };
        };
        if (infoItem.image.file) {
          const { imageUrl, error } = await uploadImage({
            file: infoItem.image.file,
            bucket: "amsterdam-assets",
            folder: "about/info-items",
          });
          if (error) {
            throw new Error(`Failed to upload image: ${error}`);
          }
          data.infoItems[i].image.image_url = imageUrl;
          delete data.infoItems[i].image.file; // Remove the file property before sending to API
        }
      }

      // Submit the form data with updated image URLs
      const response = await fetch("/api/admin/about/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update info section");
      }

      toast({
        title: "Info section updated",
        description: "The info section has been successfully updated.",
      });
      router.refresh();
    } catch (error) {
      console.error("Info section form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update info section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} className="mt-1 bg-white" />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
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
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label>Info Items (3 required)</Label>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-md">
                <Input
                  {...register(`infoItems.${index}.title`)}
                  placeholder="Item Title"
                  className="mb-2"
                />
                {errors.infoItems?.[index]?.title && (
                  <p className="text-red-500 text-sm mb-2">
                    {errors.infoItems[index]?.title?.message}
                  </p>
                )}

                <Textarea
                  {...register(`infoItems.${index}.description`)}
                  placeholder="Item Description"
                  className="mb-2"
                  rows={3}
                />
                {errors.infoItems?.[index]?.description && (
                  <p className="text-red-500 text-sm mb-2">
                    {errors.infoItems[index]?.description?.message}
                  </p>
                )}

                <div className="w-full h-40 object-cover rounded-md relative mb-2">
                  {field.image.image_url ? (
                    <Image
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={field.image.image_url}
                      alt={field.image.alt || "Info item image"}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <Input
                  {...register(`infoItems.${index}.image.alt`)}
                  placeholder="Image alt text"
                  className="mb-2"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRefs.current[index]?.click()}
                  className="w-full mb-2"
                >
                  {field.image.image_url ? "Change Image" : "Upload Image"}
                </Button>

                {index >= 3 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" /> Remove Item
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {fields.length < 3 && (
          <Button
            type="button"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                title: "",
                description: "",
                image: {
                  image_url: "",
                  alt: "",
                  image_name: "",
                  id: crypto.randomUUID(),
                },
              })
            }
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Info Item
          </Button>
        )}

        <SaveChangesButton isSubmitting={isSubmitting} className="w-full" />
      </form>
    </FormProvider>
  );
}
