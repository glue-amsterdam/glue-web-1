import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EventDay } from "@/schemas/eventSchemas";

export async function GET() {
  const supabase = await createClient();
  const { data: eventDays, error } = await supabase
    .from("events_days")
    .select("*")
    .order("dayId");

  if (error) {
    console.error("Error fetching event days:", error);
    return NextResponse.json(
      { error: "Failed to fetch event days" },
      { status: 500 }
    );
  }

  return NextResponse.json({ eventDays });
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
    const supabase = await createClient();
    const { eventDays } = await request.json();

    const updatePromises = eventDays.map(async (day: EventDay) => {
      const { data, error } = await supabase
        .from("events_days")
        .update({ label: day.label, date: day.date })
        .eq("dayId", day.dayId)
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    });

    const updatedDays = await Promise.all(updatePromises);

    return NextResponse.json({ eventDays: updatedDays });
  } catch (error) {
    console.error("Error updating event days:", error);
    return NextResponse.json(
      { error: "Failed to update event days" },
      { status: 500 }
    );
  }
}
