"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { CalendarHeart } from "lucide-react";

export function ModeratorSettings() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<ParticipantDetails>();
  const isSticky = watch("is_sticky");

  console.log(errors);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Moderator Settings</h3>
      <FormField
        name="special_program"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base flex gap-2 flex-wrap">
                <span>Special Program</span> <CalendarHeart />
              </FormLabel>
              <FormDescription>
                Enable the special program to display a special icon on the map.
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
        name="is_sticky"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Is Sticky</FormLabel>
              <FormDescription>Set this participant as sticky</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {isSticky && (
        <FormField
          control={control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  value={field.value === null ? "" : field.value}
                  className="bg-white text-black"
                />
              </FormControl>
              <FormDescription>Required when Is Sticky is true</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={field.value === "accepted" ? "default" : "outline"}
                onClick={() => field.onChange("accepted")}
                className={
                  field.value === "accepted"
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
              >
                {field.value === "accepted" ? "Accepted" : "Accept"}
              </Button>
              <Button
                type="button"
                variant={field.value === "declined" ? "default" : "outline"}
                onClick={() => field.onChange("declined")}
                className={
                  field.value === "declined"
                    ? "bg-red-500 hover:bg-red-600"
                    : ""
                }
              >
                {field.value === "declined" ? "Declined" : "Decline"}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
