import { fetchEventHeaderTitle as fetchEventHeaderTitleFromDb } from "@/lib/events/fetch-event-header-title";
import { revalidateProgramCache } from "@/lib/program/revalidate-program-cache";
import { EventDay, eventDaysResponseSchema } from "@/schemas/eventSchemas";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const fetchEventHeaderTitle = async (
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  return fetchEventHeaderTitleFromDb(client);
};

export const upsertEventHeaderTitle = async (
  headerTitle: string,
  supabase?: SupabaseClient
): Promise<{ header_title: string }> => {
  const client = supabase ?? (await createClient());
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  const { data: selectData, error: selectError } = await client
    .from("event_settings")
    .select("id")
    .limit(1);

  if (selectError || !selectData?.[0]) {
    const { data: insertData, error: insertError } = await client
      .from("event_settings")
      .insert({
        id: "00000000-0000-0000-0000-000000000001",
        header_title: headerTitle,
        updated_at: new Date().toISOString(),
        updated_by: adminToken?.value ?? null,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    revalidatePath("/program");
    revalidateProgramCache();

    return { header_title: insertData.header_title };
  }

  const id = selectData[0].id;
  const { data, error } = await client
    .from("event_settings")
    .update({
      header_title: headerTitle,
      updated_at: new Date().toISOString(),
      updated_by: adminToken?.value ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidatePath("/program");
  revalidateProgramCache();

  return { header_title: data.header_title };
};

export const fetchEventDays = async (supabase?: SupabaseClient) => {
  const client = supabase ?? (await createClient());
  const { data: eventDays, error } = await client
    .from("events_days")
    .select("*")
    .order("dayId");

  if (error) {
    throw new Error(`Error fetching event days: ${error.message}`);
  }

  return eventDaysResponseSchema.parse({ eventDays });
};

export const syncEventDays = async (
  eventDays: EventDay[],
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());

  const { data: existingDays, error: fetchError } = await client
    .from("events_days")
    .select("dayId")
    .order("dayId");

  if (fetchError) {
    throw new Error(`Error fetching existing days: ${fetchError.message}`);
  }

  const existingDayIds = existingDays.map(
    (day: { dayId: string }) => day.dayId
  );
  const newDayIds = eventDays.map((day: EventDay) => day.dayId);

  const daysToAdd = eventDays.filter(
    (day: EventDay) => !existingDayIds.includes(day.dayId)
  );
  const daysToUpdate = eventDays.filter((day: EventDay) =>
    existingDayIds.includes(day.dayId)
  );
  const daysToRemove = existingDayIds.filter(
    (dayId: string) => !newDayIds.includes(dayId)
  );

  if (daysToRemove.length > 0) {
    const { data: eventsToUpdate, error: eventsFetchError } = await client
      .from("events")
      .select("id")
      .in("dayId", daysToRemove)
      .eq("is_last_year_event", false);

    if (eventsFetchError) {
      throw new Error(
        `Error fetching events for removed days: ${eventsFetchError.message}`
      );
    }

    if (eventsToUpdate?.length) {
      const eventIds = eventsToUpdate.map((e) => e.id);
      const { error: updateError } = await client
        .from("events")
        .update({ is_last_year_event: true })
        .in("id", eventIds);

      if (updateError) {
        throw new Error(
          `Error marking events as last year: ${updateError.message}`
        );
      }
    }
  }

  for (const day of daysToAdd) {
    const { error: insertError } = await client.from("events_days").insert(day);
    if (insertError) {
      throw new Error(`Error inserting new day: ${insertError.message}`);
    }
  }

  for (const day of daysToUpdate) {
    const { error: updateError } = await client
      .from("events_days")
      .update({ label: day.label, date: day.date })
      .eq("dayId", day.dayId);

    if (updateError) {
      throw new Error(`Error updating day: ${updateError.message}`);
    }
  }

  for (const dayId of daysToRemove) {
    const { error: deleteError } = await client
      .from("events_days")
      .delete()
      .eq("dayId", dayId);

    if (deleteError) {
      throw new Error(`Error deleting day: ${deleteError.message}`);
    }
  }

  const { data: updatedDays, error: finalFetchError } = await client
    .from("events_days")
    .select("*")
    .order("dayId");

  if (finalFetchError) {
    throw new Error(
      `Error fetching updated days: ${finalFetchError.message}`
    );
  }

  return { eventDays: updatedDays };
};
