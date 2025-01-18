"use client";

import { useRef, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EVENT_TYPES } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/supabase/storage/client";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { eventSchema, EventType } from "@/schemas/eventsSchemas";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { useEventsDays } from "@/app/context/MainContext";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ImageIcon } from "lucide-react";
import { CoOrganizerSearch } from "@/app/dashboard/components/co-organizers-search";
import { Button } from "@/components/ui/button";
import { config } from "@/env";
import { LocationSelector } from "@/app/dashboard/[userId]/create-events/location-selector";

interface EventFormProps {
  existingEventCount: number;
  canCreateEvent: boolean;
}

export function EventForm({
  existingEventCount,
  canCreateEvent,
}: EventFormProps) {
  const { targetUserId } = useDashboardContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const eventDays = useEventsDays();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EventType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      type: EVENT_TYPES[0],
      dayId: eventDays.length > 0 ? eventDays[0].dayId : "",
      image_url: "",
      start_time: "",
      end_time: "",
      description: "",
      rsvp: false,
      rsvp_message: "",
      rsvp_link: "",
      co_organizers: [],
      organizer_id: targetUserId,
      location_id: "",
    },
  });

  const { isDirty } = useFormState({
    control: form.control,
  });

  if (!eventDays || eventDays.length === 0) {
    return (
      <Alert variant="default" className=" mt-10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Event Days Available</AlertTitle>
        <AlertDescription>
          There are currently no event days set up. Please contact an
          administrator to set up event days before creating an event.
        </AlertDescription>
      </Alert>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      form.setValue("image_url", imageUrl, { shouldDirty: true });
      form.setValue("file", file, { shouldDirty: true });
      setImagePreview(imageUrl);
    }
  };

  const onSubmit = async (data: EventType) => {
    setIsSubmitting(true);
    try {
      let newImageUrl = data.image_url;
      if (data.file) {
        const { imageUrl, error } = await uploadImage({
          file: data.file,
          bucket: config.bucketName,
          folder: `events/${targetUserId}`,
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

      // Create a new object with the updated image_url
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { file, ...restData } = data;
      const eventData = {
        ...restData,
        image_url: newImageUrl,
      };

      // Send the updated eventData to the server
      const response = await fetch(`/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      toast({
        title: "Success",
        description: "Event created successfully.",
      });

      // Reset form and temp image state
      form.reset({
        title: "",
        type: EVENT_TYPES[0],
        dayId: eventDays[0].dayId,
        image_url: "",
        start_time: "",
        end_time: "",
        description: "",
        rsvp: false,
        rsvp_message: "",
        rsvp_link: "",
        co_organizers: [], // Explicitly reset co-organizers to an empty array
        organizer_id: targetUserId,
        location_id: "",
      });
      setImagePreview(null);
      router.refresh();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateEvent) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Event Limit Reached</AlertTitle>
        <AlertDescription>
          You have reached the maximum number of events allowed (
          {existingEventCount}/5). Please delete an existing event before
          creating a new one.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter event title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Location</FormLabel>
                  <FormControl>
                    <LocationSelector
                      targetUserId={targetUserId}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  {eventDays.length > 0 ? (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventDays.map((day) => (
                          <SelectItem key={day.dayId} value={day.dayId}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input disabled value="No event days available" />
                  )}
                  {field.value && eventDays.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Date:{" "}
                      {new Date(
                        eventDays.find((day) => day.dayId === field.value)
                          ?.date || new Date()
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({}) => (
                <FormItem>
                  <FormLabel>Event Image</FormLabel>
                  <div className="w-full h-80 overflow-hidden bg-gray object-cover rounded-md relative mb-2">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Event image preview"
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
                      <Input type="time" {...field} value={field.value ?? ""} />
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
                      <Input type="time" {...field} value={field.value ?? ""} />
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
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="rsvp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable RSVP</FormLabel>
                    <FormDescription>
                      Allow attendees to RSVP for this event
                    </FormDescription>
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

            {form.watch("rsvp") && (
              <>
                <FormField
                  control={form.control}
                  name="rsvp_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RSVP Message</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
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
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="co_organizers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Co-organisers</FormLabel>
                  <FormControl>
                    <CoOrganizerSearch
                      onSelect={(selectedIds) => field.onChange(selectedIds)}
                      selectedParticipants={field.value || []}
                      maxSelections={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Search and select up to 4 co-organisers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SaveChangesButton
              watchFields={[
                "title",
                "type",
                "dayId",
                "image_url",
                "start_time",
                "end_time",
                "description",
                "rsvp",
                "rsvp_message",
                "rsvp_link",
                "co_organizers",
                "location_id",
              ]}
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              className="w-full"
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </SaveChangesButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
