"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventType, eventSchema } from "@/schemas/eventsSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef } from "react";
import { ImageIcon } from "lucide-react";
import { uploadImage, deleteImage } from "@/utils/supabase/storage/client";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { Checkbox } from "@/components/ui/checkbox";
import { DAYS_IDS, EVENT_TYPES } from "@/constants";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

interface EditEventFormProps {
  event: EventType;
  onEventUpdated: (updatedEvent: EventType) => void;
}

export function EditEventForm({ event, onEventUpdated }: EditEventFormProps) {
  const { toast } = useToast();
  const { targetUserId } = useDashboardContext();
  const [isImageDirty, setIsImageDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof event.image_url === "string" ? event.image_url : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EventType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ...event,
      image_url: typeof event.image_url === "string" ? event.image_url : "",
      description: event.description || "",
      co_organizers: event.co_organizers || [],
      rsvp: event.rsvp || false,
      rsvp_message: event.rsvp_message || "",
      rsvp_link: event.rsvp_link || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("file", file);
        setIsImageDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<EventType> = async (data) => {
    setIsSubmitting(true);
    try {
      let newImageUrl = data.image_url;
      if (data.file) {
        // Delete the old image if it exists
        if (event.image_url) {
          await deleteImage(event.image_url as string);
        }
        const { imageUrl, error } = await uploadImage({
          file: data.file,
          bucket: "amsterdam-assets",
          folder: `events/${targetUserId}`,
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { file, ...restData } = data;
      const eventData = {
        ...restData,
        image_url: newImageUrl,
      };

      // Send the updated data to your API
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      toast({
        title: "Success",
        description: "Event created successfully.",
      });

      const updatedEvent = await response.json();
      onEventUpdated(updatedEvent.event);
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 text-black"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dayId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Day</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DAYS_IDS.map((dayId) => (
                    <SelectItem key={dayId} value={dayId}>
                      {dayId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea value={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rsvp"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>RSVP Required</FormLabel>
              </div>
            </FormItem>
          )}
        />
        {form.watch("rsvp") && (
          <>
            <FormField
              control={form.control}
              name="rsvp_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RSVP Message</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rsvp_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RSVP Link</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="image_url"
          render={({}) => (
            <FormItem>
              <FormLabel>Event Image</FormLabel>
              <div className="w-full h-80 overflow-hidden bg-gray-100 rounded-md relative mb-2">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Event image preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <FormControl>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mb-2"
                  >
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SaveChangesButton
          isSubmitting={isSubmitting}
          isDirty={form.formState.isDirty || isImageDirty}
          watchFields={[
            "title",
            "type",
            "dayId",
            "start_time",
            "end_time",
            "description",
            "rsvp",
            "rsvp_message",
            "rsvp_link",
          ]}
          className="w-full"
        >
          Save Changes
        </SaveChangesButton>
      </form>
    </Form>
  );
}