"use client";

import { useState } from "react";
import { EventType } from "@/schemas/eventsSchemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, ClockIcon, PencilIcon, TrashIcon } from "lucide-react";
import { EditEventForm } from "@/app/dashboard/[userId]/your-events/edit-event";
import { deleteImage } from "@/utils/supabase/storage/client";

interface EventCardProps {
  event: EventType;
  onEventUpdated: (updatedEvent: EventType) => void;
  onEventDeleted: (eventId: string) => void;
}

export function EventCard({
  event,
  onEventUpdated,
  onEventDeleted,
}: EventCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  console.log(event);

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
      if (event.image_url) {
        await deleteImage(event.image_url as string);
      }
      onEventDeleted(event.id as string);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <img
            src={(event.image_url as string) || "/placeholder.jpg"}
            alt={event.title}
            className="absolute inset-0 object-cover w-full h-full"
          />
        </div>
        <CardTitle className="mt-4">{event.title}</CardTitle>
        <CardDescription>
          <Badge variant="secondary">{event.type}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{event.dayId}</span>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <ClockIcon className="h-4 w-4" />
          <span>{`${event.start_time} - ${event.end_time}`}</span>
        </div>
        <p className="mt-2 text-sm">
          <span>{event.description}</span>
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              <PencilIcon className="h-4 w-4 mr-2" />
              Modify Event
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] md:w-[70%] lg:w-[80%] max-h-[90vh] overflow-y-auto text-black">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <EditEventForm
              event={event}
              onEventUpdated={(updatedEvent) => {
                onEventUpdated(updatedEvent);
                setIsEditDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </DialogTrigger>
          <DialogContent className="text-black">
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvent}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
