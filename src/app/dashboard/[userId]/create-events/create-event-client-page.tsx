"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { DEFAULT_EMPTY_EVENT, EVENT_TYPES, safeParseDate } from "@/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { useEventsDays } from "@/app/context/MainContext";
import { eventSchema, eventDaySchema } from "@/schemas/eventSchemas";
import { Event, RSVPOptionalEvent } from "@/utils/event-types";
import useLoggedTargetUsers from "@/app/hooks/useLoggedTargetUsers";

export default function CreateEventClientPage() {
  const { loggedInUser, targetUserId } = useLoggedTargetUsers();

  console.log("targetUserId:", targetUserId);
  console.log("loggedUserId:", loggedInUser?.userId);

  const [events, setEvents] = useState<Event[]>([]);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const eventsDays = useEventsDays();

  const existingEvents = events.length;

  const form = useForm<Event>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ...DEFAULT_EMPTY_EVENT,
      date: {
        dayId: undefined,
        label: undefined,
        date: new Date(),
      },
      organizer: { userId: targetUserId as string },
      eventId: `event-${Date.now()}-${Math.random().toString(36)}`,
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) =>
      console.log("Form updated:", name, value)
    );
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit: SubmitHandler<Event> = (data) => {
    console.log("Form submitted with values:", data);

    if (events.length + existingEvents >= 5) {
      alert("You can only create up to 5 events.");
      return;
    }

    const newEvent: Event = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizer: { userId: targetUserId as string },
    };

    console.log("New event created:", newEvent);
    setEvents((prevEvents) => [...prevEvents, newEvent]);

    const resetValues: RSVPOptionalEvent = {
      ...DEFAULT_EMPTY_EVENT,
      date: {
        dayId: "day-1",
        label: eventsDays[0]?.label || "",
        date: new Date(),
      },
      rsvp: false,
      organizer: { userId: targetUserId as string },
    };
    form.reset(resetValues);
    setIsDateSelected(false);
  };
  return (
    <motion.div>
      <h1>Create Event for {targetUserId}</h1>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            console.log("Form submit event triggered");
            form.handleSubmit(onSubmit, (errors) => {
              console.log("Form validation errors:", errors);
            })(e);
          }}
          className="space-y-8 text-uiwhite"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Event thumbnail
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-4">
                        {field.value.imageUrl ? (
                          <div className="relative h-40 w-40 overflow-hidden rounded-lg">
                            <img
                              src={field.value.imageUrl}
                              alt="Event thumbnail"
                              className="absolute inset-0 object-cover w-full h-full"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                form.setValue("thumbnail", {
                                  id: "",
                                  imageUrl: "",
                                  alt: "",
                                  imageName: "",
                                  createdAt: new Date(),
                                  updatedAt: new Date(),
                                });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              form.setValue("thumbnail", {
                                id: "image-event-thumbnail-asdfas",
                                imageUrl: "/placeholders/placeholder-1.jpg",
                                alt: "Image alt text for the Event thumbnail",
                                imageName: "placeholder-1.jpg",
                                createdAt: new Date(),
                                updatedAt: new Date(),
                              });
                            }}
                            className="h-40 w-40 flex items-center justify-center"
                          >
                            Add thumbnail
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>{`Click "Add thumbnail" to select a thumbnail for your event.`}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Event Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="dashboard-input"
                        placeholder="Enter event name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="dashboard-input"
                        placeholder="Enter event description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-8">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Day</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const selectedDay = eventsDays.find(
                          (day) => day.dayId === value
                        );
                        if (selectedDay) {
                          field.onChange({
                            dayId: selectedDay.dayId as z.infer<
                              typeof eventDaySchema
                            >["dayId"],
                            label: selectedDay.label as z.infer<
                              typeof eventDaySchema
                            >["label"],
                            date: safeParseDate(selectedDay.date),
                          });
                          setIsDateSelected(true);
                        }
                      }}
                      value={field.value.dayId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!isDateSelected && (
                          <SelectItem value="0" disabled>
                            Select day
                          </SelectItem>
                        )}
                        {eventsDays.map((day) => (
                          <SelectItem key={day.dayId} value={day.dayId}>
                            {day.label}
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
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="dashboard-form-item">
                      <FormLabel className="dashboard-label">
                        Start Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="dashboard-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="dashboard-form-item">
                      <FormLabel className="dashboard-label">
                        End Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="dashboard-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Event Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="dashboard-input">
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
                name="rsvp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("rsvpMessage", undefined);
                            form.setValue("rsvpLink", undefined);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>RSVP Required</FormLabel>
                      <FormDescription>
                        Check this if attendees need to RSVP for the event.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("rsvp") && (
                <>
                  <FormField
                    control={form.control}
                    name="rsvpMessage"
                    render={({ field }) => (
                      <FormItem className="dashboard-form-item">
                        <FormLabel className="dashboard-label">
                          RSVP Message
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="dashboard-input"
                            placeholder="Enter RSVP message"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rsvpLink"
                    render={({ field }) => (
                      <FormItem className="dashboard-form-item">
                        <FormLabel className="dashboard-label">
                          RSVP Link
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="dashboard-input"
                            type="url"
                            placeholder="Enter RSVP link"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={events.length + existingEvents >= 5}
          >
            Create Event
          </Button>
        </form>
      </Form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-uiwhite">
          Created Events ({events.length + existingEvents}/5)
        </h2>
        {events.map((event) => (
          <div
            key={event.eventId}
            className="bg-primary text-primary-foreground p-4 rounded-lg mb-4 flex items-center gap-4"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-lg shrink-0">
              <img
                src={event.thumbnail.imageUrl}
                alt={event.thumbnail.alt}
                className="absolute inset-0 object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-bold">{event.name}</h3>
              <p>Type: {event.type}</p>
              <p>Date: {event.date.label}</p>
              <p>
                Time: <span>{event.startTime}</span> -{" "}
                <span>{event.endTime}</span>
              </p>
              {event.rsvp && <p>RSVP Required</p>}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
