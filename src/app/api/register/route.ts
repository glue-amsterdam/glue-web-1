import { NextResponse } from "next/server";
import { userSchema } from "@/schemas/authSchemas";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { generateUniqueSlug } from "@/utils/slugUtils";
import { v4 as uuidv4 } from "uuid";
import { SupabaseClient } from "@supabase/supabase-js";

type UserData = z.infer<typeof userSchema>;

export async function POST(request: Request) {
  const supabase = await createClient();
  const tempUserId = uuidv4();
  let realUserId: string | null = null;

  try {
    const userData: UserData = await request.json();
    const validatedData = userSchema.parse(userData);

    // Insert user info
    const { error: profileError } = await supabase.from("user_info").insert({
      user_id: tempUserId,
      user_name: validatedData.user_name || "",
      plan_id: validatedData.plan_id,
      plan_type: validatedData.plan_type,
      phone_numbers: validatedData.phone_numbers,
      social_media: validatedData.social_media,
      visible_emails: validatedData.visible_emails,
      visible_websites: validatedData.visible_websites,
      is_mod: false,
    });

    if (profileError) throw new Error(`Profile Error: ${profileError.message}`);

    // Handle invoice data for member and participant
    if (
      validatedData.plan_type === "member" ||
      validatedData.plan_type === "participant"
    ) {
      const { error: invoiceError } = await supabase
        .from("invoice_data")
        .insert({
          user_id: tempUserId,
          invoice_company_name: validatedData.invoice_company_name,
          invoice_zip_code: validatedData.invoice_zip_code,
          invoice_address: validatedData.invoice_address,
          invoice_country: validatedData.invoice_country,
          invoice_city: validatedData.invoice_city,
          invoice_extra: validatedData.invoice_extra,
        });

      if (invoiceError)
        throw new Error(`Invoice Error: ${invoiceError.message}`);
    }

    // Handle participant-specific data
    if (validatedData.plan_type === "participant") {
      const baseSlug =
        validatedData.slug ||
        (validatedData.user_name
          ? validatedData.user_name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          : uuidv4());
      const slug = await generateUniqueSlug(baseSlug);

      const { error: participantError } = await supabase
        .from("participant_details")
        .insert({
          user_id: tempUserId,
          short_description: validatedData.short_description,
          description: validatedData.description,
          slug: slug,
          is_sticky: validatedData.is_sticky,
          year: validatedData.year,
          status: validatedData.status || "pending",
        });

      if (participantError)
        throw new Error(`Participant Error: ${participantError.message}`);

      // Handle map info
      if (!validatedData.no_address) {
        const { error: mapError } = await supabase.from("map_info").insert({
          user_id: tempUserId,
          formatted_address: validatedData.formatted_address,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          no_address: validatedData.no_address,
        });

        if (mapError) throw new Error(`Map Error: ${mapError.message}`);
      }
    }

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          schema: process.env.SUPABASE_SCHEMA,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed");

    realUserId = authData.user.id;

    // Update all records with the real user ID
    const tables = [
      "user_info",
      "invoice_data",
      "participant_details",
      "map_info",
    ];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .update({ user_id: realUserId })
        .eq("user_id", tempUserId);
      if (error) {
        console.error(`Error updating ${table}:`, error);
        throw new Error(`Error updating ${table}: ${error.message}`);
      }
    }

    return NextResponse.json(
      { success: true, user: authData.user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Clean up any inserted data
    await cleanupIncompleteRegistration(supabase as SupabaseClient, tempUserId);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 }
    );
  }
}

async function cleanupIncompleteRegistration(
  supabase: SupabaseClient,
  tempUserId: string
) {
  const tables = [
    "user_info",
    "invoice_data",
    "participant_details",
    "map_info",
  ];
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("user_id", tempUserId);
    if (error) console.error(`Error cleaning up ${table}:`, error);
  }
}
