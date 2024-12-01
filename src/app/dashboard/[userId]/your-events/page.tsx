"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { DEFAULT_EMPTY_EVENT, EVENT_TYPES, safeParseDate } from "@/constants";
import { useEventsDays } from "@/app/context/MainContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Event,
  eventSchema,
  IndividualEventResponse,
} from "@/schemas/eventSchemas";
import { RichTextEditor } from "@/app/components/editor";

export default function Component() {
  const [events, setEvents] = useState<IndividualEventResponse[]>([]);
  const [editingEvent, setEditingEvent] =
    useState<IndividualEventResponse | null>(null);
  const eventsDays = useEventsDays();

  useEffect(() => {
    fetchFiveEvents().then((response) => setEvents(response));
  }, []);

  const form = useForm<Event>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ...DEFAULT_EMPTY_EVENT,
      date: eventsDays[0],
    },
  });

  useEffect(() => {
    if (editingEvent) {
      console.log("Setting form values for editing event:", editingEvent);
      form.reset({
        ...editingEvent,
        rsvp: undefined,
        coOrganizers: editingEvent.coOrganizers || undefined,
        date: {
          ...editingEvent.date,
          date: editingEvent.date.date
            ? safeParseDate(editingEvent.date.date).toISOString()
            : new Date().toISOString(),
        },
        thumbnail: {
          ...editingEvent.thumbnail,
        },
        createdAt: safeParseDate(editingEvent.createdAt),
        updatedAt: safeParseDate(editingEvent.updatedAt),
      });
    }
  }, [editingEvent, form]);

  const onSubmit: SubmitHandler<Event> = (data) => {
    console.log("Form submitted with data:", data);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Your Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.eventId} className="bg-card">
            <CardHeader>
              <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                <img
                  src={event.thumbnail.image_url || "/placeholder.svg"}
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
                <span>{event.date.label}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <ClockIcon className="h-4 w-4" />
                <span>{`${event.startTime} - ${event.endTime}`}</span>
              </div>
              <p className="mt-2 text-sm">
                <span>{event.description}</span>
              </p>
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
                <DialogContent className="w-[90%] md:w-[70%] lg:w-[80%] text-black max-h-[90%] overflow-y-scroll">
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
                          <FormItem>
                            <FormLabel>Event Name</FormLabel>
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
                            <FormControl>
                              <select
                                {...field}
                                className="w-full p-2 rounded-md border"
                              >
                                {EVENT_TYPES.map((type) => (
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
                          <FormItem>
                            <FormLabel>Event Day</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                const selectedDay = eventsDays.find(
                                  (day) => day.dayId === value
                                );
                                if (selectedDay && selectedDay.date) {
                                  field.onChange({
                                    ...selectedDay,
                                    date: safeParseDate(selectedDay.date),
                                  });
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
                          name="endTime"
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
                                      src={field.value.image_url}
                                      alt="Event thumbnail"
                                      className="absolute inset-0 object-cover w-full h-full"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2"
                                      onClick={() =>
                                        form.setValue("thumbnail", {
                                          id: "",
                                          image_url: "",
                                          alt: "Image alt text for the Event thumbnail",
                                          image_name: "",
                                        })
                                      }
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
                                        image_url:
                                          "/placeholders/placeholder-1.jpg",
                                        alt: "Image alt text for the Event thumbnail",
                                        image_name: "",
                                      });
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
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rsvp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RSVP Required</FormLabel>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value === true}
                                onChange={(e) => {
                                  const newValue = e.target.checked;
                                  field.onChange(newValue);
                                  if (newValue) {
                                    form.setValue("rsvpMessage", "");
                                    form.setValue("rsvpLink", "");
                                  } else {
                                    form.setValue("rsvpMessage", undefined);
                                    form.setValue("rsvpLink", undefined);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("rsvp") && (
                        <>
                          <FormField
                            control={form.control}
                            name="rsvpMessage"
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
                            name="rsvpLink"
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
        <p className="text-center">
          <span>{`You haven't created any events yet.`}</span>
        </p>
      )}
    </div>
  );
}
