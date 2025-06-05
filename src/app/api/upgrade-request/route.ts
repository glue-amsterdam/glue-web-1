import { config } from "@/env";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const adminEmails = config.adminEmails
    .split(",")
    .filter((email) => email.trim() !== "");
  if (adminEmails.length === 0) {
    console.warn("No admin emails configured. Skipping notification.");
    return;
  }

  try {
    const { userName, userId, planId, planName } = await request.json();

    await resend.emails.send({
      from: `GLUE <${config.baseEmail}>`,
      to: adminEmails,
      subject: "User Upgrade Request to Participant",
      html: `
        <h1>User Upgrade Request</h1>
       <p>A user has requested to upgrade their plan:</p>
       <ul>
         <li>User ID: ${userId}</li>
         <li>User Name: ${userName}</li>
         <li><strong>Selected Plan: ${planName}</strong></li>
         <li>Plan ID: ${planId}</li>
       </ul>
       <p>Please review this request and get in touch with the user regarding the <strong>${planName}</strong> plan.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending upgrade request email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
