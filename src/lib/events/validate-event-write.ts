import type { SupabaseClient } from "@supabase/supabase-js";
import { validateEventLocation } from "@/lib/events/validate-event-location";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import {
  eventPersistSchema,
  toEventDbPayload,
  type EventDbPayload,
} from "@/schemas/eventsSchemas";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ValidateEventWriteResult =
  | { ok: true; payload: EventDbPayload; organizerId: string }
  | { ok: false; response: NextResponse };

export const validateEventWrite = async (
  supabase: SupabaseClient,
  body: unknown,
  options?: { expectedOrganizerId?: string }
): Promise<ValidateEventWriteResult> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  let parsed;
  try {
    parsed = eventPersistSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Invalid event data", details: error.issues },
          { status: 400 }
        ),
      };
    }

    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid event data" },
        { status: 400 }
      ),
    };
  }

  const isMod = await getIsPlatformMod(supabase, user.id);
  const organizerId = options?.expectedOrganizerId ?? parsed.organizer_id;

  if (!isMod && user.id !== organizerId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  if (!isMod && user.id !== parsed.organizer_id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const isValidLocation = await validateEventLocation(
    supabase,
    parsed.organizer_id,
    parsed.location_id
  );

  if (!isValidLocation) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Please select a valid location" },
        { status: 400 }
      ),
    };
  }

  return {
    ok: true,
    payload: toEventDbPayload(parsed),
    organizerId: parsed.organizer_id,
  };
};
