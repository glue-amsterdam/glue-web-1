import {
  buildMapLocations,
  createMapLocationSnapshot,
} from "@/lib/map/build-map-locations";
import { revalidateMainSectionCache } from "@/lib/main/revalidate-main-section-cache";
import { revalidateMapDataCache } from "@/lib/map/revalidate-map-cache";
import { revalidateProgramCache } from "@/lib/program/revalidate-program-cache";
import { revalidateExhibitorCaches } from "@/lib/participants/revalidate-participant-visibility-caches";
import {
  buildProgramSnapshot,
  buildTourContentSnapshots,
} from "@/lib/tour/build-tour-snapshots";
import { getProgramSnapshotEventCount } from "@/lib/tour/read-tour-snapshots";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { toMediaKey } from "@/lib/media/media-url";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/config";

const TOUR_STATUS_ROW_ID = "00000000-0000-0000-0000-000000000001";

const VALID_ACTIONS = ["close", "open", "repair-program-snapshot"] as const;

const revalidatePublicTourCaches = (): void => {
  revalidateMapDataCache();
  revalidateMainSectionCache();
  revalidateProgramCache();
  revalidateExhibitorCaches();
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: tourStatus, error } = await supabase
      .from("tour_status")
      .select(
        `
        id,
        current_tour_status,
        updated_at,
        updated_by,
        previous_tour_program
      `
      )
      .single();

    if (error) {
      console.error("Error fetching tour status:", error);
      return NextResponse.json(
        { error: "Failed to fetch tour status" },
        { status: 500 }
      );
    }

    const programSnapshotEventCount = getProgramSnapshotEventCount(
      tourStatus.previous_tour_program
    );

    return NextResponse.json({
      id: tourStatus.id,
      current_tour_status: tourStatus.current_tour_status,
      updated_at: tourStatus.updated_at,
      updated_by: tourStatus.updated_by ?? null,
      programSnapshotEventCount,
    });
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
    const supabase = await createAdminClient();
    const { current_tour_status, action } = await request.json();

    if (
      action &&
      !VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid action. Must be 'close', 'open', or 'repair-program-snapshot'",
        },
        { status: 400 }
      );
    }

    if (action === "repair-program-snapshot") {
      const { data: tourRow, error: tourReadError } = await supabase
        .from("tour_status")
        .select("current_tour_status, previous_tour_program")
        .eq("id", TOUR_STATUS_ROW_ID)
        .single();

      if (tourReadError || !tourRow) {
        console.error("Error reading tour status for repair:", tourReadError);
        return NextResponse.json(
          { error: "Failed to read tour status" },
          { status: 500 }
        );
      }

      if (tourRow.current_tour_status !== "older") {
        return NextResponse.json(
          {
            error:
              "Program snapshot repair is only allowed when tour status is older",
          },
          { status: 400 }
        );
      }

      const existingCount = getProgramSnapshotEventCount(
        tourRow.previous_tour_program
      );
      if (existingCount > 0) {
        return NextResponse.json(
          {
            error:
              "Program snapshot already has events; repair refused to overwrite",
          },
          { status: 400 }
        );
      }

      let programSnapshot;
      try {
        programSnapshot = await buildProgramSnapshot(supabase, "last_year");
      } catch (snapshotError) {
        console.error("Error rebuilding program snapshot:", snapshotError);
        return NextResponse.json(
          {
            error:
              snapshotError instanceof Error
                ? snapshotError.message
                : "Failed to rebuild program snapshot",
          },
          { status: 500 }
        );
      }

      if (programSnapshot.details.length === 0) {
        return NextResponse.json(
          {
            error:
              "No last-year events available to rebuild the program snapshot",
          },
          { status: 400 }
        );
      }

      const { data, error: statusError } = await supabase
        .from("tour_status")
        .update({
          previous_tour_program: programSnapshot,
          updated_at: new Date().toISOString(),
        })
        .eq("id", TOUR_STATUS_ROW_ID)
        .select("id, current_tour_status, updated_at");

      if (statusError) {
        console.error("Error saving repaired program snapshot:", statusError);
        return NextResponse.json(
          { error: "Failed to save repaired program snapshot" },
          { status: 500 }
        );
      }

      revalidateProgramCache();

      return NextResponse.json({
        ...data[0],
        programSnapshotEventCount: programSnapshot.details.length,
        programEventsCount: programSnapshot.details.length,
        message: `Program snapshot repaired with ${programSnapshot.details.length} event(s).`,
      });
    }

    if (action === "close" || current_tour_status === "older") {
      // 1. Build content snapshots from live current-tour data BEFORE flags flip.
      let contentSnapshots;
      try {
        contentSnapshots = await buildTourContentSnapshots(supabase);
      } catch (snapshotError) {
        console.error("Error building tour content snapshots:", snapshotError);
        return NextResponse.json(
          {
            error:
              snapshotError instanceof Error
                ? snapshotError.message
                : "Failed to build tour content snapshots",
          },
          { status: 500 }
        );
      }

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

      const { data: currentEventDays, error: eventDaysFetchError } =
        await supabase
          .from("events_days")
          .select("dayId, label, date")
          .order("dayId");

      if (eventDaysFetchError) {
        console.error(
          "Error fetching event days for snapshot:",
          eventDaysFetchError
        );
        return NextResponse.json(
          { error: "Failed to fetch event days for snapshot" },
          { status: 500 }
        );
      }

      const eventDaysSnapshot = (currentEventDays || []).map((day) => ({
        dayId: day.dayId,
        label: day.label,
        date: day.date,
      }));

      // 2. Flag active participants + current events for previous tour.
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

      // 3. Persist snapshots and flip status.
      const { data, error: statusError } = await supabase
        .from("tour_status")
        .update({
          current_tour_status: "older",
          previous_tour_event_days: eventDaysSnapshot,
          previous_tour_map_info: mapInfoSnapshot,
          previous_tour_program: contentSnapshots.program,
          previous_tour_exhibitors_grouped: contentSnapshots.exhibitorsGrouped,
          previous_tour_exhibitor_details: contentSnapshots.exhibitorDetails,
          previous_tour_hub_details: contentSnapshots.hubDetails,
          previous_tour_participant_categories:
            contentSnapshots.participantCategories,
          updated_at: new Date().toISOString(),
        })
        .eq("id", TOUR_STATUS_ROW_ID)
        .select();

      if (statusError) {
        console.error("Error updating tour status:", statusError);
        return NextResponse.json(
          { error: "Failed to update tour status" },
          { status: 500 }
        );
      }

      const { count: participantCount } = await supabase
        .from("participant_details")
        .select("*", { count: "exact", head: true })
        .eq("was_active_last_year", true);

      const mapLocationsCount = mapInfoSnapshot.locations.length;
      revalidatePublicTourCaches();

      return NextResponse.json({
        ...data[0],
        participantCount: participantCount || 0,
        mapLocationsCount,
        programEventsCount: contentSnapshots.program.details.length,
        programSnapshotEventCount: contentSnapshots.program.details.length,
        exhibitorDetailsCount: Object.keys(
          contentSnapshots.exhibitorDetails.bySlug
        ).length,
        message: `Tour closed successfully. Snapshotted program (${contentSnapshots.program.details.length}), exhibitors, categories, event days (${eventDaysSnapshot.length}), and map (${mapLocationsCount} locations).`,
      });
    }

    if (action === "open" || current_tour_status === "new") {
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
              console.error(
                `Failed to delete image for event ${event.id}:`,
                error
              );
            }
          }
        }

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

      const { data, error: statusError } = await supabase
        .from("tour_status")
        .update({
          current_tour_status: "new",
          previous_tour_event_days: null,
          previous_tour_map_info: null,
          previous_tour_program: null,
          previous_tour_exhibitors_grouped: null,
          previous_tour_exhibitor_details: null,
          previous_tour_hub_details: null,
          previous_tour_participant_categories: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", TOUR_STATUS_ROW_ID)
        .select();

      if (statusError) {
        console.error("Error updating tour status:", statusError);
        return NextResponse.json(
          { error: "Failed to update tour status" },
          { status: 500 }
        );
      }

      const deletedCount = oldEvents?.length || 0;
      revalidatePublicTourCaches();

      return NextResponse.json({
        ...data[0],
        deletedEventsCount: deletedCount,
        programSnapshotEventCount: 0,
        message: `New tour opened successfully. ${deletedCount} old event(s) and their images have been deleted.`,
      });
    }

    const { data, error: statusError } = await supabase
      .from("tour_status")
      .update({
        current_tour_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", TOUR_STATUS_ROW_ID)
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
