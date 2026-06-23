import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { config } from "@/config";
import { revalidateParticipantVisibilityCaches } from "@/lib/participants/revalidate-participant-visibility-caches";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import {
  getEmailTemplateWithFallback,
  processEmailTemplate,
} from "@/utils/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const mod = await requirePlatformMod();
  if (!mod.ok) return mod.response;

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      config.supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(userId);

    if (error || !user) {
      console.error("Error fetching user data:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 404 }
      );
    }

    // Get participant details
    const { data: participantData, error: participantError } = await supabase
      .from("participant_details")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (participantError || !participantData) {
      return NextResponse.json(
        { error: "Failed to fetch participant details" },
        { status: 500 }
      );
    }

    // Update participant_details
    const { error: updateParticipantError } = await supabase
      .from("participant_details")
      .update({
        is_active: true,
        status: "accepted",
        reactivation_requested: false,
        reactivation_status: "approved",
      })
      .eq("user_id", userId);

    if (updateParticipantError) {
      return NextResponse.json(
        { error: "Failed to update participant details" },
        { status: 500 }
      );
    }

    // Update participant_details extra fields and plan from reactivation notes
    if (participantData.reactivation_notes) {
      const notes = participantData.reactivation_notes as Record<string, unknown>;

      const participantUpdate: Record<string, unknown> = {
        plan_id: notes.plan_id ?? participantData.plan_id,
        plan_type: notes.plan_type ?? participantData.plan_type,
      };

      if (typeof notes.short_description === "string") {
        participantUpdate.short_description = notes.short_description;
      }
      if (Array.isArray(notes.phone_numbers)) {
        participantUpdate.phone_numbers = notes.phone_numbers;
      }
      if (Array.isArray(notes.visible_emails)) {
        participantUpdate.visible_emails = notes.visible_emails;
      }
      if (Array.isArray(notes.visible_websites)) {
        participantUpdate.visible_websites = notes.visible_websites;
      }
      if (typeof notes.glue_communication_email === "string") {
        participantUpdate.glue_communication_email = notes.glue_communication_email;
      }
      if (notes.social_media && typeof notes.social_media === "object") {
        participantUpdate.social_media = notes.social_media;
      }

      const { error: participantFieldsError } = await supabase
        .from("participant_details")
        .update(participantUpdate)
        .eq("user_id", userId);

      if (participantFieldsError) {
        return NextResponse.json(
          { error: "Failed to update participant profile fields" },
          { status: 500 }
        );
      }

      const invoicePayload = {
        user_id: userId,
        invoice_company_name:
          typeof notes.invoice_company_name === "string"
            ? notes.invoice_company_name
            : undefined,
        invoice_zip_code:
          typeof notes.invoice_zip_code === "string"
            ? notes.invoice_zip_code
            : undefined,
        invoice_address:
          typeof notes.invoice_address === "string"
            ? notes.invoice_address
            : undefined,
        invoice_country:
          typeof notes.invoice_country === "string"
            ? notes.invoice_country
            : undefined,
        invoice_city:
          typeof notes.invoice_city === "string" ? notes.invoice_city : undefined,
        invoice_extra:
          typeof notes.invoice_extra === "string" ? notes.invoice_extra : null,
      };

      const hasInvoiceFields = [
        invoicePayload.invoice_company_name,
        invoicePayload.invoice_zip_code,
        invoicePayload.invoice_address,
        invoicePayload.invoice_country,
        invoicePayload.invoice_city,
      ].every((value) => typeof value === "string" && value.length > 0);

      if (hasInvoiceFields) {
        const { data: existingInvoice } = await supabase
          .from("invoice_data")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingInvoice) {
          const { error: invoiceError } = await supabase
            .from("invoice_data")
            .update(invoicePayload)
            .eq("user_id", userId);

          if (invoiceError) {
            return NextResponse.json(
              { error: "Failed to update invoice data" },
              { status: 500 }
            );
          }
        } else {
          const { error: invoiceError } = await supabase
            .from("invoice_data")
            .insert(invoicePayload);

          if (invoiceError) {
            return NextResponse.json(
              { error: "Failed to create invoice data" },
              { status: 500 }
            );
          }
        }
      }
    }

    // Update map_info
    if (participantData.reactivation_notes) {
      const notes = participantData.reactivation_notes as Record<string, unknown>;
      const { error: updateMapInfoError } = await supabase
        .from("map_info")
        .update({
          formatted_address:
            typeof notes.formatted_address === "string"
              ? notes.formatted_address
              : null,
          latitude:
            typeof notes.latitude === "number" ? notes.latitude : null,
          longitude:
            typeof notes.longitude === "number" ? notes.longitude : null,
          no_address: Boolean(notes.no_address),
          exhibition_space_preference:
            typeof notes.exhibition_space_preference === "string"
              ? notes.exhibition_space_preference
              : null,
        })
        .eq("user_id", userId);

      if (updateMapInfoError) {
        return NextResponse.json(
          { error: "Failed to update map info" },
          { status: 500 }
        );
      }
    }

    // Send email to participant
    try {
      const template = await getEmailTemplateWithFallback(
        "participant-reactivated"
      );
      const htmlContent = processEmailTemplate(template.html_content, {
        email: user.email,
        user_name: participantData.display_name || user.email,
      });

      await resend.emails.send({
        from: `GLUE <${config.baseEmail}>`,
        to: user.email,
        subject: template.subject,
        html: htmlContent,
      });
    } catch (emailError) {
      console.error("Error sending reactivation email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email notification" },
        { status: 500 }
      );
    }

    await revalidateParticipantVisibilityCaches(supabase);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing reactivation approval:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
