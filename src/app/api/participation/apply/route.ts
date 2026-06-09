import { NextResponse } from "next/server";
import {
  participantApplicationSchema,
  participantApplicationWithAccountSchema,
  reactivationApplicationSchema,
} from "@/schemas/participationSchemas";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { generateUniqueSlug } from "@/utils/slugUtils";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import { ensureVisitorDataForAuthUser } from "@/lib/visitor/ensure-visitor-data";
import { createVisitorToken } from "@/lib/visitor/create-visitor-token";
import {
  sendModeratorParticipantNotification,
  sendParticipantRegistrationEmail,
} from "@/lib/email";
import { config } from "@/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const PARTICIPANT_PLAN_TYPE = "participant" as const;

const ensureParticipantPlan = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  planId: string
) => {
  const { data: plan, error } = await supabase
    .from("plans")
    .select("plan_id, plan_type, plan_label, is_participant_enabled")
    .eq("plan_id", planId)
    .maybeSingle();

  if (error || !plan?.is_participant_enabled) {
    return null;
  }

  return plan;
};

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const intent =
    typeof json === "object" &&
      json !== null &&
      "intent" in json &&
      typeof (json as { intent: string }).intent === "string"
      ? (json as { intent: string }).intent
      : "new";

  if (intent === "reactivation") {
    const parsed = reactivationApplicationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await createAdminClient();
    const { data: participantDetails } = await admin
      .from("participant_details")
      .select("user_id, is_active, status, reactivation_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!participantDetails) {
      return NextResponse.json(
        {
          error:
            "No participant profile found. Submit a new application instead.",
        },
        { status: 409 }
      );
    }

    if (participantDetails.is_active) {
      return NextResponse.json(
        {
          error:
            "You are already an active participant. Manage your profile from the dashboard.",
        },
        { status: 409 }
      );
    }

    if (participantDetails.status === "pending") {
      return NextResponse.json(
        {
          error:
            "Your participant application is still under review. Reactivation is not available yet.",
        },
        { status: 409 }
      );
    }

    if (participantDetails.reactivation_status === "pending") {
      return NextResponse.json(
        {
          error:
            "Your reactivation request is already pending review by administrators.",
        },
        { status: 409 }
      );
    }

    const plan = await ensureParticipantPlan(supabase, parsed.data.plan_id);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const reactivationData = {
      ...parsed.data.reactivation,
      plan_type: PARTICIPANT_PLAN_TYPE,
      plan_label: plan.plan_label,
    };

    const { error: updateError } = await admin
      .from("participant_details")
      .update({
        reactivation_requested: true,
        reactivation_notes: reactivationData,
        reactivation_status: "pending",
        plan_id: parsed.data.plan_id,
        plan_type: PARTICIPANT_PLAN_TYPE,
      })
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    const { data: profile } = await admin
      .from("participant_details")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const adminEmails = config.adminEmails
      .split(",")
      .filter((e) => e.trim() !== "");

    if (adminEmails.length > 0 && user.email) {
      try {
        await resend.emails.send({
          from: `GLUE <${config.baseEmail}>`,
          to: adminEmails,
          subject: "Participant Reactivation Request",
          html: `<p>Reactivation request from ${profile?.display_name ?? user.email}</p><p>Plan: ${plan.plan_label}</p>`,
        });
      } catch (e) {
        console.error("Reactivation email:", e);
      }
    }

    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  let {
    data: { user },
  } = await supabase.auth.getUser();

  const needsAccount = !user;

  const parsed = needsAccount
    ? participantApplicationWithAccountSchema.safeParse(json)
    : participantApplicationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (needsAccount) {
    const accountData = participantApplicationWithAccountSchema.parse(json);
    const admin = await createAdminClient();
    const normalizedEmail = accountData.email.toLowerCase();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: accountData.password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    if (!authData.user) {
      return NextResponse.json({ error: "Sign up failed" }, { status: 500 });
    }

    user = authData.user;

    const fullName = `${accountData.firstName} ${accountData.lastName}`.trim();
    const { data: existingVisitor } = await admin
      .from("visitor_data")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingVisitor?.id) {
      const { error: visitorError } = await admin
        .from("visitor_data")
        .update({
          auth_user_id: user.id,
          first_name: accountData.firstName,
          last_name: accountData.lastName,
          email: normalizedEmail,
          full_name: fullName,
        })
        .eq("id", existingVisitor.id);

      if (visitorError) {
        return NextResponse.json({ error: visitorError.message }, { status: 500 });
      }
    } else {
      const { error: visitorError } = await admin.from("visitor_data").insert({
        auth_user_id: user.id,
        first_name: accountData.firstName,
        last_name: accountData.lastName,
        email: normalizedEmail,
        full_name: fullName,
        visitor_token: createVisitorToken(),
      });

      if (visitorError) {
        return NextResponse.json({ error: visitorError.message }, { status: 500 });
      }
    }
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await ensureParticipantPlan(supabase, data.plan_id);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { data: visitorRow } = await admin
    .from("visitor_data")
    .select("first_name, last_name, display_name, full_name, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const displayName = getVisitorDisplayName(visitorRow ?? {});
  const userEmail = user.email ?? visitorRow?.email ?? data.glue_communication_email;

  const { data: existingParticipant } = await admin
    .from("participant_details")
    .select("user_id, status, is_active, reactivation_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingParticipant && data.intent === "upgrade") {
    if (!existingParticipant.is_active) {
      return NextResponse.json(
        {
          error:
            "Inactive participants must use the reactivation flow instead of upgrade.",
        },
        { status: 409 }
      );
    }

    if (existingParticipant.status === "pending") {
      return NextResponse.json(
        {
          error:
            "Your participant application is still under review. Upgrade is not available yet.",
        },
        { status: 409 }
      );
    }
  }

  if (
    existingParticipant &&
    data.intent === "new" &&
    existingParticipant.status !== "declined"
  ) {
    if (existingParticipant.status === "pending") {
      return NextResponse.json(
        {
          error:
            "Your participant application is already under review. Please wait for moderator approval.",
        },
        { status: 409 }
      );
    }

    if (!existingParticipant.is_active) {
      return NextResponse.json(
        {
          error:
            "You already have a participant profile. Use the reactivation flow if you need to re-subscribe.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "You are already an active participant. Manage your profile from the dashboard.",
      },
      { status: 409 }
    );
  }

  const baseSlug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = await generateUniqueSlug(baseSlug || user.id);

  const participantPayload = {
    user_id: user.id,
    short_description: data.short_description,
    description: null as string | null,
    slug,
    status: "pending",
    is_active: true,
    special_program: false,
    reactivation_requested: false,
    plan_id: data.plan_id,
    plan_type: PARTICIPANT_PLAN_TYPE,
    display_name: displayName,
    phone_numbers: data.phone_numbers ?? [],
    social_media: data.social_media ?? {},
    visible_emails: data.visible_emails ?? [],
    visible_websites: data.visible_websites ?? [],
    glue_communication_email: data.glue_communication_email,
    upgrade_requested: data.intent === "upgrade",
    upgrade_requested_plan_id: data.intent === "upgrade" ? data.plan_id : null,
    upgrade_requested_plan_type:
      data.intent === "upgrade" ? PARTICIPANT_PLAN_TYPE : null,
    upgrade_requested_at:
      data.intent === "upgrade" ? new Date().toISOString() : null,
  };

  if (existingParticipant) {
    const { error: updateError } = await admin
      .from("participant_details")
      .update(participantPayload)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { error: insertError } = await admin
      .from("participant_details")
      .insert(participantPayload);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const { data: existingInvoice } = await admin
    .from("invoice_data")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const invoicePayload = {
    user_id: user.id,
    invoice_company_name: data.invoice_company_name,
    invoice_zip_code: data.invoice_zip_code,
    invoice_address: data.invoice_address,
    invoice_country: data.invoice_country,
    invoice_city: data.invoice_city,
    invoice_extra: data.invoice_extra ?? null,
  };

  if (existingInvoice) {
    await admin.from("invoice_data").update(invoicePayload).eq("user_id", user.id);
  } else {
    await admin.from("invoice_data").insert(invoicePayload);
  }

  const mapPayload = {
    user_id: user.id,
    no_address: data.no_address,
    formatted_address: data.no_address ? null : data.formatted_address,
    latitude: data.no_address ? null : data.latitude,
    longitude: data.no_address ? null : data.longitude,
    exhibition_space_preference: data.exhibition_space_preference ?? null,
  };

  const { data: existingMap } = await admin
    .from("map_info")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMap) {
    await admin.from("map_info").update(mapPayload).eq("user_id", user.id);
  } else {
    await admin.from("map_info").insert(mapPayload);
  }

  const notificationPayload = {
    user_id: user.id,
    user_name: displayName,
    email: userEmail,
    plan_id: data.plan_id,
    plan_type: PARTICIPANT_PLAN_TYPE,
    short_description: data.short_description,
    invoice_company_name: data.invoice_company_name,
    invoice_address: data.invoice_address,
    invoice_city: data.invoice_city,
    invoice_zip_code: data.invoice_zip_code,
    invoice_country: data.invoice_country,
    invoice_extra: data.invoice_extra ?? undefined,
    formatted_address: data.formatted_address,
    latitude: data.latitude,
    longitude: data.longitude,
    no_address: data.no_address,
    exhibition_space_preference: data.exhibition_space_preference,
    phone_numbers: data.phone_numbers ?? undefined,
    social_media: data.social_media as Record<string, string> | undefined,
    visible_emails: data.visible_emails ?? undefined,
    glue_communication_email: data.glue_communication_email,
    visible_websites: data.visible_websites ?? undefined,
  };

  await sendModeratorParticipantNotification(
    notificationPayload as Parameters<typeof sendModeratorParticipantNotification>[0]
  );

  if (userEmail) {
    await sendParticipantRegistrationEmail({
      email: userEmail,
      user_name: displayName,
    });
  }

  await ensureVisitorDataForAuthUser(
    user.id,
    {
      email: userEmail,
      displayName,
      userName: displayName,
    },
    user.email ?? userEmail
  );

  return NextResponse.json({ success: true, userId: user.id });
}
