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
import Separator from "@/components/separator";
import { eventSchema, EventFormInput, EventType } from "@/schemas/eventsSchemas";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import type { EventDay } from "@/schemas/eventSchemas";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ImageIcon } from "lucide-react";
import { CoOrganizerSearch } from "@/app/dashboard/components/co-organizers-search";
import { Button } from "@/components/ui/button";
import { config } from "@/config";
import { LocationSelector } from "@/app/dashboard/[userId]/events/components/location-selector";
import Image from "next/image";
import {
  ImageUploadOverlay,
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

interface EventFormProps {
  targetUserId: string;
  existingEventCount: number;
  planMaxEvents: number;
  canCreateEvent: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function EventForm({
  targetUserId,
  existingEventCount,
  planMaxEvents,
  canCreateEvent,
}: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const { toast } = useToast();

  const { data: eventDays = [], isLoading: isLoadingEventDays } = useSWR<
    EventDay[]
  >("/api/events/days/current", fetcher);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EventFormInput, unknown, EventType>({
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

  if (isLoadingEventDays) {
    return (
      <Alert variant="default" className="mt-10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Loading Event Days</AlertTitle>
        <AlertDescription>
          Please wait while we load the available event days...
        </AlertDescription>
      </Alert>
    );
  }

  if (!eventDays || eventDays.length === 0) {
    return (
      <Alert variant="default" className="mt-10">
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
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File too large",
        description:
          "Large images are compressed automatically, but must be under 20 MB.",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    form.setValue("image_url", imageUrl, { shouldDirty: true });
    form.setValue("file", file, { shouldDirty: true });
    setImagePreview(imageUrl);
  };

  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  const onSubmit = async (data: EventType) => {
    setIsSubmitting(true);
    try {
      let newImageUrl = data.image_url;
      if (data.file) {
        setUploadState({ stage: "compressing", progress: 5 });

        const { imageUrl, error } = await uploadImage({
          file: data.file,
          bucket: config.bucketName,
          folder: `events/${targetUserId}`,
          onProgress: handleUploadProgress,
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

      setUploadState({ stage: "saving", progress: 96 });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { file, ...restData } = data;
      const eventData = {
        ...restData,
        image_url: newImageUrl,
      };

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

      setUploadState({ stage: "saving", progress: 100 });

      toast({
        title: "Success",
        description: "Event created successfully.",
      });

      router.push(`/dashboard/${targetUserId}/events`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadState(null);
    }
  };

  if (!canCreateEvent) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Event Limit Reached</AlertTitle>
        <AlertDescription>
          You have reached the maximum number of events allowed (
          {existingEventCount}/{planMaxEvents}). Please delete an existing
          event before creating a new one.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="px-[30px] mini-padding">
      <h1 className="title-text">Create New Event</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[15px] lg:space-y-[30px] mini-padding">
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
            render={() => (
              <FormItem>
                <FormLabel>Event Image</FormLabel>
                <div className="w-full h-80 overflow-hidden bg-gray object-cover relative mb-2">
                  {imagePreview ? (
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Event image preview"
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover "
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 ">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {uploadState && (
                    <ImageUploadOverlay
                      stage={uploadState.stage}
                      progress={uploadState.progress}
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mb-2"
                  disabled={isSubmitting || Boolean(uploadState)}
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
              <FormItem className="flex flex-row items-center justify-between border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="">Enable RSVP</FormLabel>
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

          <div className="flex justify-center mini-padding">
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
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </SaveChangesButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
