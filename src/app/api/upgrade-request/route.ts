import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { userName, userId } = await request.json();

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "azua.javi@gmail.com",
      subject: "User Upgrade Request to Participant",
      html: `
        <h1>User Upgrade Request</h1>
        <p>A user has requested to upgrade their plan:</p>
        <ul>
          <li>User ID: ${userId}</li>
          <li>User Name: ${userName}</li>
        </ul>
        <p>Please review this request and get in touch with the user.</p>
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
