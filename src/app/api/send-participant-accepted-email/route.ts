import { config } from "@/config";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import {
  getEmailTemplateWithFallback,
  processEmailTemplate,
} from "@/utils/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const mod = await requirePlatformMod();
  if (!mod.ok) return mod.response;

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

  try {
    const { userId } = await request.json();

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

    const { data: participantData, error: participantError } = await supabase
      .from("participant_details")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (participantError) {
      console.warn("Failed to fetch participant details, using email as fallback");
    }

    try {
      const template = await getEmailTemplateWithFallback(
        "participant-accepted"
      );
      const htmlContent = processEmailTemplate(template.html_content, {
        email: user.email,
        user_name: participantData?.display_name || user.email,
      });

      await resend.emails.send({
        from: `GLUE <${config.baseEmail}>`,
        to: user.email,
        subject: template.subject,
        html: htmlContent,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in participant acceptance process:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
