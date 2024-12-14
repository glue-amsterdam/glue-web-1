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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, ClockIcon, PencilIcon } from "lucide-react";
import { EditEventForm } from "@/app/dashboard/[userId]/your-events/edit-event";

interface EventCardProps {
  event: EventType;
  onEventUpdated: (updatedEvent: EventType) => void;
}

export function EventCard({ event, onEventUpdated }: EventCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <img
            src={(event.image_url as string) || "/placeholder.svg"}
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
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
