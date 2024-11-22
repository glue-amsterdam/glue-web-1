"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Suspense, useMemo } from "react";
import EventSkeleton from "@/app/components/events/event-skeleton";
import EventContent from "@/app/components/events/event-content";
import { useEventData } from "@/app/hooks/useEventData";

export function EventModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const { event, mapData, isLoading, error } = useEventData(eventId);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("eventId");
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const memoizedContent = useMemo(() => {
    if (isLoading) return <EventSkeleton />;
    if (error) return <div>Error: {error.message}</div>;
    if (event && mapData)
      return <EventContent event={event} mapData={mapData} />;
    return null;
  }, [event, mapData, isLoading, error]);

  return (
    <Dialog open={!!eventId} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90%] md:max-w-[60vw] max-h-[90vh] bg-background text-black overflow-y-auto">
        <DialogTitle className="text-3xl sr-only">{event?.name}</DialogTitle>
        <Suspense fallback={<EventSkeleton />}>{memoizedContent}</Suspense>
      </DialogContent>
    </Dialog>
  );
}
