"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, PencilIcon } from "lucide-react";
import { fetchFiveEvents } from "@/utils/api";

const contributorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().url(),
});

const eventSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  thumbnail: z.string().url("Please enter a valid URL for the thumbnail"),
  creator: contributorSchema,
  contributors: z.array(contributorSchema),
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
  type: z.enum(["Lecture", "Workshop", "Drink", "Guided Tour", "Exhibition"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type Event = z.infer<typeof eventSchema>;

export default function YourEventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchFiveEvents().then((response) => setEvents(response.events));
  }, []);

  const form = useForm<Event>({
    resolver: zodResolver(eventSchema),
    defaultValues: editingEvent || {
      id: "",
      name: "",
      thumbnail: "",
      creator: { id: "", name: "", avatar: "" },
      contributors: [],
      date: "",
      startTime: "",
      endTime: "",
      type: "Lecture",
      description: "",
    },
  });

  useEffect(() => {
    if (editingEvent) {
      form.reset(editingEvent);
    }
  }, [editingEvent, form]);

  const onSubmit: SubmitHandler<Event> = (data) => {
    setEvents(events.map((event) => (event.id === data.id ? data : event)));
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-uiwhite">Your Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="bg-primary text-primary-foreground">
            <CardHeader>
              <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                <img
                  src={event.thumbnail}
                  alt={event.name}
                  className="absolute inset-0 object-cover w-full h-full"
                />
              </div>
              <CardTitle className="mt-4">{event.name}</CardTitle>
              <CardDescription>
                <Badge variant="secondary">{event.type}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <ClockIcon className="h-4 w-4" />
                <span>{`${event.startTime} - ${event.endTime}`}</span>
              </div>
              <p className="mt-2 text-sm">{event.description}</p>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setEditingEvent(event)}
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] md:w-[70%] lg:w-[80%] text-uiblack">
                  <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="dashboard-form-item">
                            <FormLabel className="dashboard-label">
                              Event Name
                            </FormLabel>
                            <FormControl>
                              <Input className="dashboard-input" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem className="dashboard-form-item">
                            <FormLabel className="dashboard-label">
                              Event Type
                            </FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full p-2 rounded-md"
                              >
                                {[
                                  "Lecture",
                                  "Workshop",
                                  "Drink",
                                  "Guided Tour",
                                  "Exhibition",
                                ].map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="dashboard-form-item">
                            <FormLabel className="dashboard-label">
                              Date
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="dashboard-input"
                                type="date"
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
                                  className="dashboard-input"
                                  type="time"
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
                                  className="dashboard-input"
                                  type="time"
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
                                      onClick={() =>
                                        form.setValue("thumbnail", "")
                                      }
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
                            <FormDescription>
                              {`Click "Add thumbnail" to select an thumbnail for your event.`}
                            </FormDescription>
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
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
      {events.length === 0 && (
        <p className="text-uiwhite text-center">{`You haven't created any events yet.`}</p>
      )}
      {events.length < 5 && (
        <Button className="w-full mt-4">Create New Event</Button>
      )}
    </div>
  );
}
