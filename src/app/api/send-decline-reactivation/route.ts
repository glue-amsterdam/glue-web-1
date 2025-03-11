import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { config } from "@/env";
import { sendDeclineReactivationEmail } from "@/components/emails/participant-details-emails";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
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

    // Update participant details
    const { error: updateError } = await supabase
      .from("participant_details")
      .update({
        reactivation_status: "declined",
        is_active: false,
      })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update participant details" },
        { status: 500 }
      );
    }

    // Get user information for email
    const { data: userData, error: userError } = await supabase
      .from("user_info")
      .select("user_name")
      .eq("user_id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Failed to fetch user information" },
        { status: 500 }
      );
    }

    try {
      await resend.emails.send({
        from: `GLUE <${config.baseEmail}>`,
        to: user.email,
        subject: "Your Reactivation Request Has Been Declined",
        html: sendDeclineReactivationEmail(userData.user_name, user.email),
      });
    } catch (emailError) {
      console.error("Error sending reactivation declined email:", emailError);
      // We don't return an error here because the main action (declining) was successful
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error declining reactivation:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
