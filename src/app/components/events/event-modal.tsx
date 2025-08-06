"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Suspense, useMemo, useCallback, memo } from "react";
import EventSkeleton from "@/app/components/events/event-skeleton";
import EventContent from "@/app/components/events/event-content";
import { useEventData } from "@/app/hooks/useEventData";

const EventModal = memo(function EventModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoizar eventId para evitar re-renders innecesarios
  const eventId = useMemo(() => searchParams.get("eventId"), [searchParams]);

  const { event, isLoading, error } = useEventData(eventId);

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("eventId");
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [router, searchParams]);

  const content = useMemo(() => {
    if (isLoading) {
      return <EventSkeleton />;
    } else if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!event) {
      return <div>No event found.</div>;
    } else {
      return <EventContent event={event} />;
    }
  }, [isLoading, error, event]);

  // Solo renderizar el modal si hay un eventId
  if (!eventId) {
    return null;
  }

  return (
    <Dialog open={!!eventId} onOpenChange={handleClose}>
      <DialogContent
        data-lenis-prevent
        className="max-w-[90%] md:max-w-[60vw] max-h-[90vh] bg-background text-black overflow-y-auto"
      >
        <DialogTitle className="text-3xl sr-only">{event?.name}</DialogTitle>
        <Suspense fallback={<EventSkeleton />}>{content}</Suspense>
      </DialogContent>
    </Dialog>
  );
});

export default EventModal;
