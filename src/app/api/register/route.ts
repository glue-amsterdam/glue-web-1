import { NextResponse } from "next/server";
import { userSchema } from "@/schemas/authSchemas";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { generateUniqueSlug } from "@/utils/slugUtils";
import {
  sendModeratorFreeUserNotification,
  sendModeratorMemberNotification,
  sendModeratorParticipantNotification,
} from "@/lib/email";

type UserData = z.infer<typeof userSchema>;

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const userData: UserData = await request.json();
    const validatedData = userSchema.parse(userData);

    // Create the auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: { schema: process.env.SUPABASE_SCHEMA },
      },
    });

    if (authError) throw new Error(`Auth Error: ${authError.message}`);
    if (!authData.user) throw new Error("User creation failed");

    const realUserId = authData.user.id; // The real user_id

    // Insert user info
    const { error: profileError } = await supabase.from("user_info").insert({
      user_id: realUserId,
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

    // Handle invoice data
    if (
      validatedData.plan_type === "member" ||
      validatedData.plan_type === "participant"
    ) {
      const { error: invoiceError } = await supabase
        .from("invoice_data")
        .insert({
          user_id: realUserId,
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
          : realUserId); // Use user ID as fallback for slug
      const slug = await generateUniqueSlug(baseSlug);

      const { error: participantError } = await supabase
        .from("participant_details")
        .insert({
          user_id: realUserId,
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
          user_id: realUserId,
          formatted_address: validatedData.formatted_address,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          no_address: validatedData.no_address,
        });
        if (mapError) throw new Error(`Map Error: ${mapError.message}`);
      }
    }

    // Send email notification to moderators based on plan type
    switch (userData.plan_type) {
      case "free":
        await sendModeratorFreeUserNotification({
          user_id: realUserId,
          user_name: userData.user_name,
          email: userData.email,
        });
        break;
      case "member":
        await sendModeratorMemberNotification({
          user_id: realUserId,
          user_name: userData.user_name,
          email: userData.email,
          invoice_company_name: userData.invoice_company_name,
          invoice_address: userData.invoice_address,
          invoice_city: userData.invoice_city,
          invoice_zip_code: userData.invoice_zip_code,
          invoice_country: userData.invoice_country,
          invoice_extra: userData.invoice_extra,
        });
        break;
      case "participant":
        await sendModeratorParticipantNotification({
          ...userData,
          user_id: realUserId,
        });
        break;
    }

    return NextResponse.json(
      { success: true, user: authData.user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
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
