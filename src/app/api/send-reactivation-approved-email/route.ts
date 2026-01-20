import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { config } from "@/env";
import {
  getEmailTemplateWithFallback,
  processEmailTemplate,
} from "@/utils/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
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

    // Update map_info
    if (participantData.reactivation_notes) {
      const { error: updateMapInfoError } = await supabase
        .from("map_info")
        .update({
          formatted_address:
            participantData.reactivation_notes.formatted_address,
          latitude: participantData.reactivation_notes.latitude,
          longitude: participantData.reactivation_notes.longitude,
          no_address: participantData.reactivation_notes.no_address,
        })
        .eq("user_id", userId);

      if (updateMapInfoError) {
        return NextResponse.json(
          { error: "Failed to update map info" },
          { status: 500 }
        );
      }
    }

    // Update user_info
    if (participantData.reactivation_notes) {
      const { error: updateUserInfoError } = await supabase
        .from("user_info")
        .update({
          plan_id: participantData.reactivation_notes.plan_id,
          plan_type: participantData.reactivation_notes.plan_type,
        })
        .eq("user_id", userId);

      if (updateUserInfoError) {
        return NextResponse.json(
          { error: "Failed to update user info" },
          { status: 500 }
        );
      }
    }

    // Get user information
    const { data: userData, error: userError } = await supabase
      .from("user_info")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Failed to fetch user information" },
        { status: 500 }
      );
    }

    // Send email to participant
    try {
      const template = await getEmailTemplateWithFallback(
        "participant-reactivated"
      );
      const htmlContent = processEmailTemplate(template.html_content, {
        email: user.email,
        user_name: userData.user_name || user.email,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing reactivation approval:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
