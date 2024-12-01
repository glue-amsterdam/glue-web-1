"use client";

import { useState, useCallback, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import {
  DEFAULT_EMPTY_EVENT,
  EMPTY_IMAGE,
  EVENT_TYPES,
  safeParseDate,
} from "@/constants";
import { useEventsDays } from "@/app/context/MainContext";
import { eventSchema, Event, EnhancedUser } from "@/schemas/eventSchemas";
import useLoggedTargetUsers from "@/app/hooks/useLoggedTargetUsers";
import { RichTextEditor } from "@/app/components/editor";
import { placeholderImage } from "@/mockConstants";
import { fetchParticipantsIdandName } from "@/utils/api";

export default function CreateEventClientPage() {
  const { targetUserId } = useLoggedTargetUsers();
  const [coOrganizerInput, setCoOrganizerInput] = useState("");
  const [suggestions, setSuggestions] = useState<EnhancedUser[]>([]);
  const [selectedCoOrganizers, setSelectedCoOrganizers] = useState<
    EnhancedUser[]
  >([]);
  const [events, setEvents] = useState<Event[]>([]);
  const eventsDays = useEventsDays();

  const form = useForm<Event>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ...DEFAULT_EMPTY_EVENT,
      type: undefined,
      organizer: { userId: targetUserId as string },
      eventId: `event-${Date.now()}-${Math.random().toString(36)}`,
      coOrganizers: [],
      date: {
        dayId: undefined,
        label: undefined,
        date: new Date().toISOString(),
      }, // Initialize with empty values
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "coOrganizers",
  });

  const { control } = form;
  const { errors } = useFormState({ control });

  const watchRSVP = form.watch("rsvp");

  const handleCoOrganizerInputChange = useCallback(async (value: string) => {
    setCoOrganizerInput(value);
    if (value.length >= 2) {
      try {
        const results = await fetchParticipantsIdandName(value);
        setSuggestions(results);
      } catch (error) {
        console.error("Error searching participants:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, []);

  const addCoOrganizer = useCallback(() => {
    const selectedUser = suggestions.find(
      (user) => user.userName.toLowerCase() === coOrganizerInput.toLowerCase()
    );
    if (
      selectedUser &&
      fields.length < 4 &&
      !fields.some((field) => field.userId === selectedUser.userId)
    ) {
      append({ userId: selectedUser.userId });
      setSelectedCoOrganizers((prev) => [...prev, selectedUser]);
      setCoOrganizerInput("");
      setSuggestions([]);
    }
  }, [coOrganizerInput, suggestions, fields, append]);

  const removeCoOrganizer = useCallback(
    (index: number) => {
      remove(index);
      setSelectedCoOrganizers((prev) => prev.filter((_, i) => i !== index));
    },
    [remove]
  );

  const onSubmit = useCallback(
    (data: Event) => {
      if (events.length >= 5) {
        alert("You can only create up to 5 events.");
        return;
      }

      const newEvent: Event = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        organizer: { userId: targetUserId as string },
      };

      console.log("New event data:", newEvent);

      setEvents((prev) => [...prev, newEvent]);
      form.reset({
        ...DEFAULT_EMPTY_EVENT,
        organizer: { userId: targetUserId },
        eventId: `event-${Date.now()}-${Math.random().toString(36)}`,
        coOrganizers: [],
        date: {
          dayId: undefined,
          label: undefined,
          date: new Date().toISOString(),
        },
        rsvp: false,
      });
    },
    [events.length, targetUserId, form]
  );

  const memoizedEventsList = useMemo(() => {
    return events.map((event) => (
      <div
        key={event.eventId}
        className="bg-primary text-primary-foreground p-4 rounded-lg mb-4"
      >
        <h3 className="font-bold">{event.name}</h3>
        <p>Type: {event.type}</p>
        <p>Date: {event.date.label}</p>
        <p>
          Time: {event.startTime} - {event.endTime}
        </p>
        {event.rsvp && <p>RSVP Required</p>}
        {event.coOrganizers && event.coOrganizers.length > 0 && (
          <p>
            Co-organizers:{" "}
            {event.coOrganizers
              .map(
                (co) =>
                  selectedCoOrganizers.find(
                    (selected) => selected.userId === co.userId
                  )?.userName || co.userId
              )
              .join(", ")}
          </p>
        )}
      </div>
    ));
  }, [events, selectedCoOrganizers]);

  return (
    <motion.div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Create Event for {targetUserId}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        {field.value.image_url ? (
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
                              onClick={() => {
                                form.setValue("thumbnail", EMPTY_IMAGE);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              form.setValue("thumbnail", placeholderImage);
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
                    <FormControl className="bg-white text-black">
                      <Input placeholder="Enter event name" {...field} />
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
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-8">
              <FormField
                control={control}
                name="date"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">Event Day</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const selectedDay = eventsDays.find(
                          (day) => day.dayId === value
                        );
                        if (selectedDay && selectedDay.date) {
                          field.onChange({
                            dayId: selectedDay.dayId,
                            label: selectedDay.label,
                            date: safeParseDate(selectedDay.date),
                          });
                        }
                      }}
                      value={field.value.dayId}
                    >
                      <FormControl className="bg-white text-black">
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
                    <FormMessage>{errors.date?.message}</FormMessage>
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
                      <FormControl className="bg-white text-black">
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
                    <FormItem className="dashboard-form-item">
                      <FormLabel className="dashboard-label">
                        End Time
                      </FormLabel>
                      <FormControl className="bg-white text-black">
                        <Input type="time" {...field} />
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
                      <FormControl className="bg-white text-black">
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0" disabled>
                          Select event type
                        </SelectItem>
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 dashboard-form-item">
                    <FormControl className="bg-white text-black">
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
                      <FormLabel className="dashboard-label">
                        RSVP Required
                      </FormLabel>
                      <FormDescription>
                        Check this if attendees need to RSVP for the event.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {watchRSVP && (
                <>
                  <FormField
                    control={form.control}
                    name="rsvpMessage"
                    render={({ field }) => (
                      <FormItem className="dashboard-form-item">
                        <FormLabel className="dashboard-label">
                          RSVP Message
                        </FormLabel>
                        <FormControl className="bg-white text-black">
                          <Input placeholder="Enter RSVP message" {...field} />
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
                        <FormControl className="bg-white text-black">
                          <Input
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

          <FormField
            control={form.control}
            name="coOrganizers"
            render={() => (
              <FormItem className="dashboard-form-item">
                <FormLabel className="dashboard-label">Co-organizers</FormLabel>
                <FormControl>
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={coOrganizerInput}
                        onChange={(e) =>
                          handleCoOrganizerInputChange(e.target.value)
                        }
                        className="bg-white text-black"
                        placeholder="Search co-organizers by name or id"
                        list="co-organizer-suggestions"
                      />
                      <Button
                        type="button"
                        onClick={addCoOrganizer}
                        disabled={
                          fields.length >= 4 ||
                          !suggestions.some(
                            (s) =>
                              s.userName.toLowerCase() ===
                              coOrganizerInput.toLowerCase()
                          )
                        }
                      >
                        Add
                      </Button>
                    </div>
                    <datalist id="co-organizer-suggestions">
                      {suggestions.map((suggestion) => (
                        <option
                          key={suggestion.userId}
                          value={suggestion.userName}
                        />
                      ))}
                    </datalist>
                    <div className="flex flex-wrap gap-2">
                      {selectedCoOrganizers.map((coOrganizer, index) => (
                        <Badge key={coOrganizer.userId} variant="secondary">
                          {coOrganizer.userName}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => removeCoOrganizer(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Add up to 4 co-organizers for this event.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full md:w-auto">
            Create Event
          </Button>
        </form>
      </Form>
      <div className="mt-8">{memoizedEventsList}</div>
    </motion.div>
  );
}
