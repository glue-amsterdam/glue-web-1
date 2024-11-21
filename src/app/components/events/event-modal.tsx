"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Suspense } from "react";
import EventSkeleton from "@/app/components/events/event-skeleton";
import EventServerComponent from "@/app/components/events/event-server-call";

export function EventModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("eventId");
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <Dialog open={!!eventId} onOpenChange={handleClose}>
      <Suspense fallback={<EventSkeleton />}>
        {eventId && <EventServerComponent eventId={eventId} />}
      </Suspense>
    </Dialog>
  );
}
