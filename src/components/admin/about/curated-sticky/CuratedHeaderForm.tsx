"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/app/components/editor";
import { ColorPicker } from "@/components/ui/color-picker";
import { CuratedMemberSectionHeader } from "@/schemas/curatedSchema";

export const CuratedHeaderForm = () => {
  const { control } = useFormContext<CuratedMemberSectionHeader>();

  return (
    <div className="space-y-4">
      <FormField
        name="is_visible"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Visible</FormLabel>
              <FormDescription>
                Toggle to show or hide the CURATED STICKY section
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
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
        control={control}
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
        control={control}
        name="text_color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Text Color</FormLabel>
            <FormDescription>
              Pick the color of the text in the carousel
            </FormDescription>
            <FormControl>
              <ColorPicker
                value={field.value || "#fff"}
                onChange={field.onChange}
                label="Pick text color"
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="background_color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Background Color</FormLabel>
            <FormDescription>
              Pick the color of the background of the curated sticky section
            </FormDescription>
            <FormControl>
              <ColorPicker
                value={field.value || "#000000"}
                onChange={field.onChange}
                label="Pick background color"
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
