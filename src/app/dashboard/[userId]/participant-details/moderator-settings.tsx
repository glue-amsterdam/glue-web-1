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
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetails } from "@/schemas/participantDetailsSchemas";
import { CalendarHeart } from "lucide-react";

export function ModeratorSettings() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ParticipantDetails>();

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
