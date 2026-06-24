import { NextResponse } from "next/server";
import { subscribeToNewsletterBestEffort } from "@/lib/newsletter/subscribe-to-mailchimp";
import { visitorRegisterSchema } from "@/schemas/visitorSchemas";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createVisitorToken } from "@/lib/visitor/create-visitor-token";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = visitorRegisterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    firstName,
    lastName,
    email,
    password,
    birthDate,
    areaId,
    newsletterSubscribe,
  } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 }
      );
    }

    const admin = await createAdminClient();
    const { data: existingVisitor } = await admin
      .from("visitor_data")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingVisitor?.id) {
      const { error: linkError } = await admin
        .from("visitor_data")
        .update({
          auth_user_id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email: normalizedEmail,
          full_name: `${firstName} ${lastName}`.trim(),
          birth_date: birthDate,
          area_id: areaId,
        })
        .eq("id", existingVisitor.id);

      if (linkError) throw linkError;

      if (newsletterSubscribe) {
        await subscribeToNewsletterBestEffort(
          {
            firstName,
            lastName,
            email: normalizedEmail,
          },
          "POST /api/visitors/register",
        );
      }

      return NextResponse.json({
        success: true,
        visitorId: existingVisitor.id,
        userId: authData.user.id,
      });
    }

    const { data: visitorRow, error: insertError } = await admin
      .from("visitor_data")
      .insert({
        auth_user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        full_name: `${firstName} ${lastName}`.trim(),
        birth_date: birthDate,
        area_id: areaId,
        visitor_token: createVisitorToken(),
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    if (newsletterSubscribe) {
      await subscribeToNewsletterBestEffort(
        {
          firstName,
          lastName,
          email: normalizedEmail,
        },
        "POST /api/visitors/register",
      );
    }

    return NextResponse.json({
      success: true,
      visitorId: visitorRow.id,
      userId: authData.user.id,
    });
  } catch (err) {
    console.error("POST /api/visitors/register:", err);
    return NextResponse.json(
      { error: "Could not complete registration. Try again later." },
      { status: 500 }
    );
  }
}
