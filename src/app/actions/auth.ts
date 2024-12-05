"use server";

import { userSchema } from "@/schemas/authSchemas";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { generateUniqueSlug } from "@/utils/slugUtils";
import { nanoid } from "nanoid";

type UserData = z.infer<typeof userSchema>;

export async function registerUser(userData: UserData) {
  try {
    const supabase = await createClient();
    // Validate user data
    const validatedData = userSchema.parse(userData);

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed");

    // Insert user info directly after user creation
    const { error: profileError } = await supabase.from("user_info").insert({
      user_id: authData.user.id,
      user_name: validatedData.user_name || "",
      plan_id: validatedData.plan_id,
      plan_type: validatedData.plan_type,
      phone_numbers: validatedData.phone_numbers,
      social_media: validatedData.social_media,
      visible_emails: validatedData.visible_emails,
      visible_websites: validatedData.visible_websites,
      is_mod: false, // Default value
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
          user_id: authData.user.id,
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
        validatedData.slug || validatedData.user_name || nanoid(10);
      const slug = await generateUniqueSlug(baseSlug);

      const { error: participantError } = await supabase
        .from("participant_details")
        .insert({
          user_id: authData.user.id,
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
          user_id: authData.user.id,
          formatted_address: validatedData.formatted_address,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          no_address: validatedData.no_address,
        });

        if (mapError) throw new Error(`Map Error: ${mapError.message}`);
      }
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
