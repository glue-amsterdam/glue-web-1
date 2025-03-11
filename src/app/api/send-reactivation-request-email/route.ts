import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { reactivationNotesSchema } from "@/schemas/participantDetailsSchemas";
import { Resend } from "resend";
import { config } from "@/env";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, reactivationData } = body;

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

    // Validate reactivation data
    try {
      reactivationNotesSchema.parse(reactivationData);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid reactivation data", details: error },
        { status: 400 }
      );
    }

    // Get user information
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

    // Update participant details with reactivation request
    const { error: updateError } = await supabase
      .from("participant_details")
      .update({
        reactivation_requested: true,
        reactivation_notes: reactivationData,
        reactivation_status: "pending",
      })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update participant details", details: updateError },
        { status: 500 }
      );
    }

    // Get plan information
    let planInfo = "No plan selected";
    if (reactivationData.plan_id) {
      const { data: planData } = await supabase
        .from("plans")
        .select("*")
        .eq("plan_id", reactivationData.plan_id)
        .single();

      if (planData) {
        planInfo = `${planData.plan_label} (${planData.plan_type})`;
      }
    }

    // Format address information
    let addressInfo = "No address provided";
    if (reactivationData.no_address) {
      addressInfo = "Participant requested an address to be provided";
    } else if (reactivationData.formatted_address) {
      addressInfo = reactivationData.formatted_address;
    }

    const adminEmails = config.adminEmails
      .split(",")
      .filter((email) => email.trim() !== "");
    if (adminEmails.length === 0) {
      console.warn("No admin emails configured. Skipping notification.");
      return;
    }

    // Send email to admins
    try {
      await resend.emails.send({
        from: `GLUE <${config.baseEmail}>`,
        to: adminEmails,
        subject: `Reactivation Request from ${
          userData.user_name || user.email
        }`,
        html: `
          <h1>Participant Reactivation Request</h1>
          <p><strong>Participant:</strong> ${
            userData.user_name || user.email
          }</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Plan:</strong> ${planInfo}</p>
          <p><strong>Address:</strong> ${addressInfo}</p>
          <p><strong>Notes:</strong> ${
            reactivationData.notes || "No notes provided"
          }</p>
          <p>Please review this request in the admin dashboard.</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending reactivation request email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending reactivation request email:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
