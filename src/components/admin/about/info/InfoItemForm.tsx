import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon } from "lucide-react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { uploadImage } from "@/utils/supabase/storage/client";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RichTextEditor } from "@/app/components/editor";
import { config } from "@/env";
import { type InfoItem } from "@/schemas/infoSchema";
import { mutate } from "swr";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const infoItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  image_url: z.string().optional(),
  isVisible: z.boolean(),
  file: z.any().optional(),
  oldImageUrl: z.string().optional(),
});

const infoItemsSchema = z.array(infoItemSchema);

interface InfoItemFormProps {
  initialItems: InfoItem[];
}

const DEFAULT_INFO_ITEMS = [
  {
    id: "mission-statement",
    title: "",
    description: "",
    is_visible: false,
    image_url: "",
  },
  {
    id: "meet-the-team",
    title: "",
    description: "",
    is_visible: false,
    image_url: "",
  },
  {
    id: "glue-foundation",
    title: "",
    description: "",
    is_visible: false,
    image_url: "",
  },
];

export function InfoItemForm({ initialItems }: InfoItemFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<{ infoItems: InfoItem[] }>({
    resolver: zodResolver(z.object({ infoItems: infoItemsSchema })),
    defaultValues: {
      infoItems: mergeInfoItems(initialItems, DEFAULT_INFO_ITEMS),
    },
  });

  useEffect(() => {
    const mergedItems = mergeInfoItems(initialItems, DEFAULT_INFO_ITEMS);
    form.reset({ infoItems: mergedItems });
  }, [initialItems, form]);

  function mergeInfoItems(
    initialItems: InfoItem[],
    defaultItems: InfoItem[]
  ): InfoItem[] {
    const mergedItems = [...defaultItems];
    initialItems.forEach((item) => {
      const index = mergedItems.findIndex(
        (defaultItem) => defaultItem.id === item.id
      );
      if (index !== -1) {
        mergedItems[index] = { ...mergedItems[index], ...item };
      }
    });
    return mergedItems;
  }

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      const oldImageUrl = form.getValues(`infoItems.${index}.image_url`);

      form.setValue(`infoItems.${index}.image_url`, imageUrl, {
        shouldDirty: true,
      });
      form.setValue(`infoItems.${index}.file`, file, {
        shouldDirty: true,
      });
      form.setValue(`infoItems.${index}.oldImageUrl`, oldImageUrl, {
        shouldDirty: true,
      });

      form.trigger(`infoItems.${index}.image_url`);
    }
  };

  const onSubmitInfoItem = async (index: number) => {
    setIsSubmitting(true);
    const infoItem = form.getValues(`infoItems.${index}`);
    try {
      let newImageUrl = infoItem.image_url;
      if (infoItem.file) {
        const { imageUrl, error } = await uploadImage({
          file: infoItem.file,
          bucket: config.bucketName,
          folder: "about/info-items",
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

      const response = await fetch(`/api/admin/about/info/${infoItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...infoItem,
          image_url: newImageUrl,
          oldImageUrl: infoItem.oldImageUrl,
        }),
      });

      mutate("/api/admin/about/info");

      if (!response.ok) {
        throw new Error("Failed to update info item");
      }

      toast({
        title: "info item updated",
        description: `${infoItem.title} has been successfully updated.`,
      });

      form.setValue(`infoItems.${index}.image_url`, newImageUrl);
      form.setValue(`infoItems.${index}.oldImageUrl`, undefined);
      form.setValue(`infoItems.${index}.file`, undefined);
    } catch (error) {
      console.error(`${infoItem.title} submission error:`, error);
      toast({
        title: "Error",
        description: `Failed to update info item ${
          index + 1
        }. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-5 justify-around">
        {form.watch("infoItems").map((field, index) => (
          <form
            key={field.id}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitInfoItem(index);
            }}
            className="border p-4 rounded-md w-full"
          >
            <FormField
              control={form.control}
              name={`infoItems.${index}.is_visible`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Visible</FormLabel>
                    <FormDescription>
                      Toggle to show or hide this info item
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`infoItems.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Item Title"
                      className="mb-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full h-40 object-cover rounded-md relative mb-2">
              {field.image_url ? (
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={field.image_url || "/placeholder.jpg"}
                  alt={`Info item ${index + 1}`}
                  className="object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRefs.current[index]?.click()}
              className="w-full mb-2"
            >
              {field.image_url ? "Change Image" : "Upload Image"}
            </Button>

            <FormField
              control={form.control}
              name={`infoItems.${index}.description`}
              render={({ field }) => (
                <FormItem className="max-h-[80vh] overflow-y-scroll">
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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

            <SaveChangesButton
              isSubmitting={isSubmitting}
              watchFields={[
                `infoItems.${index}.title`,
                `infoItems.${index}.description`,
                `infoItems.${index}.image_url`,
                `infoItems.${index}.file`,
                `infoItems.${index}.oldImageUrl`,
                `infoItems.${index}.is_visible`,
              ]}
              className="w-full mt-4"
            />
          </form>
        ))}
      </div>
    </Form>
  );
}
