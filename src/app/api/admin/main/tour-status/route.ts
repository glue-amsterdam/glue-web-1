import {
  buildMapLocations,
  createMapLocationSnapshot,
} from "@/lib/map/build-map-locations";
import { revalidateMainSectionCache } from "@/lib/main/revalidate-main-section-cache";
import { revalidateMapDataCache } from "@/lib/map/revalidate-map-cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { toMediaKey } from "@/lib/media/media-url";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/config";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: tourStatus, error } = await supabase
      .from("tour_status")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching tour status:", error);
      return NextResponse.json(
        { error: "Failed to fetch tour status" },
        { status: 500 }
      );
    }

    return NextResponse.json(tourStatus);
  } catch (error) {
    console.error("Error in GET /api/admin/main/tour-status:", error);
    return NextResponse.json(
      { error: "Failed to fetch tour status" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  try {
    // Use admin client to bypass RLS when closing/opening tours
    // This is required for all database operations: updating participants, events, 
    // fetching/deleting old events, and updating tour_status
    const supabase = await createAdminClient();
    const { current_tour_status, action } = await request.json();

    // Validate action type
    if (action && !["close", "open"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'close' or 'open'" },
        { status: 400 }
      );
    }

    // If closing tour (setting to "older"), perform atomic operations
    if (action === "close" || current_tour_status === "older") {
      // Start a transaction-like operation by performing all updates

      // 1. Update all active participants: set was_active_last_year = true
      const { error: participantError } = await supabase
        .from("participant_details")
        .update({ was_active_last_year: true })
        .eq("is_active", true);

      if (participantError) {
        console.error("Error updating participants:", participantError);
        return NextResponse.json(
          { error: "Failed to update participants" },
          { status: 500 }
        );
      }

      // 2. Update all current tour events: set is_last_year_event = true
      // Only update events that are not already marked as last year events
      const { error: eventsError } = await supabase
        .from("events")
        .update({ is_last_year_event: true })
        .eq("is_last_year_event", false)
        .eq("event_day_out", false);

      if (eventsError) {
        console.error("Error updating events:", eventsError);
        return NextResponse.json(
          { error: "Failed to update events" },
          { status: 500 }
        );
      }

      // 3. Save snapshot of current event days before closing tour
      // Fetch ALL current event days to store as snapshot (no filtering needed)
      const { data: currentEventDays, error: eventDaysFetchError } =
        await supabase
          .from("events_days")
          .select("dayId, label, date")
          .order("dayId");

      if (eventDaysFetchError) {
        console.error("Error fetching event days for snapshot:", eventDaysFetchError);
        return NextResponse.json(
          { error: "Failed to fetch event days for snapshot" },
          { status: 500 }
        );
      }

      // Transform to snapshot format (only dayId, label, date)
      const eventDaysSnapshot = (currentEventDays || []).map((day) => ({
        dayId: day.dayId,
        label: day.label,
        date: day.date,
      }));

      // 4. Save lean map snapshot (v2) before closing tour
      let mapInfoSnapshot = createMapLocationSnapshot([]);

      try {
        const locations = await buildMapLocations(supabase, "new");
        mapInfoSnapshot = createMapLocationSnapshot(locations);
      } catch (mapError) {
        console.error("Error building map snapshot:", mapError);
        return NextResponse.json(
          { error: "Failed to fetch map info for snapshot" },
          { status: 500 }
        );
      }

      // 5. Update tour status to "older" and save the snapshots
      const { data, error: statusError } = await supabase
        .from("tour_status")
        .update({
          current_tour_status: "older",
          previous_tour_event_days: eventDaysSnapshot,
          previous_tour_map_info: mapInfoSnapshot,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .select();

      if (statusError) {
        console.error("Error updating tour status:", statusError);
        return NextResponse.json(
          { error: "Failed to update tour status" },
          { status: 500 }
        );
      }

      // Get count of participants that were marked
      const { count: participantCount } = await supabase
        .from("participant_details")
        .select("*", { count: "exact", head: true })
        .eq("was_active_last_year", true);

      const mapLocationsCount = mapInfoSnapshot.locations.length;
      revalidateMapDataCache();
      revalidateMainSectionCache();
      return NextResponse.json({
        ...data[0],
        participantCount: participantCount || 0,
        mapLocationsCount: mapLocationsCount,
        message: `Tour closed successfully. All active participants, events, event days (${eventDaysSnapshot.length}), and map data (${mapLocationsCount} locations) have been marked/snapshotted for the previous tour.`,
      });
    }

    // If opening new tour (setting to "new")
    if (action === "open" || current_tour_status === "new") {
      // Fetch all last year events to delete them and their images
      const { data: oldEvents, error: fetchOldEventsError } = await supabase
        .from("events")
        .select("id, image_url")
        .eq("is_last_year_event", true);

      if (fetchOldEventsError) {
        console.error("Error fetching old events:", fetchOldEventsError);
        return NextResponse.json(
          { error: "Failed to fetch old events for deletion" },
          { status: 500 }
        );
      }

      // Delete event images from storage. Stored values are bucket-relative keys
      // (toMediaKey also tolerates legacy absolute URLs).
      if (oldEvents && oldEvents.length > 0) {
        for (const event of oldEvents) {
          const path = toMediaKey(event.image_url as string | null);
          if (path && !path.startsWith("/") && !/^https?:\/\//i.test(path)) {
            try {
              const { error: storageError } = await supabase.storage
                .from(config.bucketName)
                .remove([path]);

              if (storageError) {
                console.error(
                  `Failed to delete image for event ${event.id}:`,
                  storageError
                );
              }
            } catch (error) {
              // Log but don't fail if image deletion fails
              console.error(`Failed to delete image for event ${event.id}:`, error);
            }
          }
        }

        // Delete old events from database
        const eventIds = oldEvents.map((e) => e.id);
        const { error: deleteEventsError } = await supabase
          .from("events")
          .delete()
          .in("id", eventIds);

        if (deleteEventsError) {
          console.error("Error deleting old events:", deleteEventsError);
          return NextResponse.json(
            { error: "Failed to delete old events" },
            { status: 500 }
          );
        }
      }

      // Update tour status to "new" and clear snapshots
      // Snapshots are only needed when viewing "older" tour, so we can clear them
      // when opening a new tour to keep database clean
      const { data, error: statusError } = await supabase
        .from("tour_status")
        .update({
          current_tour_status: "new",
          previous_tour_event_days: null,
          previous_tour_map_info: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .select();

      if (statusError) {
        console.error("Error updating tour status:", statusError);
        return NextResponse.json(
          { error: "Failed to update tour status" },
          { status: 500 }
        );
      }

      const deletedCount = oldEvents?.length || 0;
      revalidateMapDataCache();
      revalidateMainSectionCache();
      return NextResponse.json({
        ...data[0],
        deletedEventsCount: deletedCount,
        message: `New tour opened successfully. ${deletedCount} old event(s) and their images have been deleted.`,
      });
    }

    // Default: just update the status without performing snapshot operations
    const { data, error: statusError } = await supabase
      .from("tour_status")
      .update({
        current_tour_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .select();

    if (statusError) {
      console.error("Error updating tour status:", statusError);
      return NextResponse.json(
        { error: "Failed to update tour status" },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
