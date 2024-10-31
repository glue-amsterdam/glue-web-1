"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { EVENT_TYPES } from "@/constants";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  thumbnail: z.string().min(1, "Please add a thumbnail"),
  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Please enter a valid date in YYYY-MM-DD format"
    ),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Please enter a valid time in HH:MM format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Please enter a valid time in HH:MM format"),
  type: z.enum(EVENT_TYPES),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  rsvp: z.boolean().default(false),
  rsvpMessage: z.string().optional(),
  rsvpLink: z.string().url("Please enter a valid URL").optional(),
});

export default function EventCreationForm({
  existingEvents = 0,
}: {
  existingEvents?: number;
}) {
  const [events, setEvents] = useState<z.infer<typeof formSchema>[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      thumbnail: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "Lecture",
      description: "",
      rsvp: false,
      rsvpMessage: "",
      rsvpLink: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (events.length + existingEvents >= 5) {
      alert("You can only create up to 5 events.");
      return;
    }
    setEvents([...events, values]);
    console.log("New event created:", values);
    form.reset();
  }

  return (
    <motion.div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
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
                        {field.value ? (
                          <div className="relative h-40 w-40 overflow-hidden rounded-lg">
                            <img
                              src={field.value}
                              alt="Event thumbnail"
                              className="absolute inset-0 object-cover w-full h-full"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => form.setValue("thumbnail", "")}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              const newthumbnail = `/placeholders/placeholder-1.jpg`;
                              form.setValue("thumbnail", newthumbnail);
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
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="dashboard-input"
                        {...field}
                      />
                    </FormControl>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                        onCheckedChange={field.onChange}
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
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-primary text-primary-foreground p-4 rounded-lg mb-4 flex items-center gap-4"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-lg shrink-0">
              <img
                src={event.thumbnail}
                alt={event.name}
                className="absolute inset-0 object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-bold">{event.name}</h3>
              <p>Type: {event.type}</p>
              <p>Date: {event.date}</p>
              <p>
                Time: {event.startTime} - {event.endTime}
              </p>
              {event.rsvp && <p>RSVP Required</p>}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
