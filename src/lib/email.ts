import { Resend } from "resend";
import { UserData } from "@/schemas/authSchemas";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendModeratorFreeUserNotification(userData: {
  user_id: string;
  user_name?: string;
  email: string;
}) {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "azua.javi@gmail.com",
      subject: "New Visitor User Registration",
      html: `
        <h1>New Visitor Registered</h1>
        <p>A new visitor has registered with the following details:</p>
        <ul>
          <li>User ID: ${userData.user_id}</li>
          <li>Username: ${userData.user_name || "N/A"}</li>
          <li>Email: ${userData.email}</li>
        </ul>
      `,
    });
  } catch (error) {
    console.error("Error sending moderator notification for free user:", error);
  }
}

export async function sendModeratorMemberNotification(userData: {
  user_id: string;
  user_name?: string;
  email: string;
  invoice_company_name: string;
  invoice_address: string;
  invoice_city: string;
  invoice_zip_code: string;
  invoice_country: string;
  invoice_extra?: string;
}) {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "azua.javi@gmail.com",
      subject: "New Member Registration",
      html: `
        <h1>New Member Registered</h1>
        <p>A new member has registered with the following details:</p>
        <h2>User Information</h2>
        <ul>
          <li>User ID: ${userData.user_id}</li>
          <li>Username: ${userData.user_name || "N/A"}</li>
          <li>Email: ${userData.email}</li>
        </ul>
        
        <h2>Invoice Information</h2>
        <ul>
          <li>Company Name: ${userData.invoice_company_name}</li>
          <li>Address: ${userData.invoice_address}</li>
          <li>City: ${userData.invoice_city}</li>
          <li>Zip Code: ${userData.invoice_zip_code}</li>
          <li>Country: ${userData.invoice_country}</li>
          <li>Extra Information: ${userData.invoice_extra || "N/A"}</li>
        </ul>
      `,
    });
  } catch (error) {
    console.error("Error sending moderator notification for member:", error);
  }
}

export async function sendModeratorParticipantNotification(
  userData: UserData & {
    user_id: string;
    plan_id: string;
    plan_type: string;
    invoice_company_name: string;
    invoice_address: string;
    invoice_city: string;
    invoice_zip_code: string;
    invoice_country: string;
    invoice_extra?: string;
    formatted_address?: string;
    latitude?: number;
    longitude?: number;
    no_address?: boolean;
    social_media?: Record<string, string>;
    visible_emails?: string[];
    visible_websites?: string[];
    phone_numbers?: string[];
    email: string;
  }
) {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "azua.javi@gmail.com",
      subject: "New Participant Registration",
      html: `
        <h1>New Participant Registered</h1>
        <p>A new participant has registered and requires approval. Details:</p>
        <h2>User Information</h2>
        <ul>
          <li>User ID: ${userData.user_id}</li>
          <li>Username: ${userData.user_name || "N/A"}</li>
          <li>Email: ${userData.email}</li>
          <li>Phone Numbers: ${userData.phone_numbers?.join(", ") || "N/A"}</li>
          <li>Social Media: ${
            userData.social_media
              ? Object.entries(userData.social_media)
                  .map(([platform, link]) => `${platform}: ${link}`)
                  .join(", ")
              : "N/A"
          }</li>
          <li>Visible Emails: ${
            userData.visible_emails?.join(", ") || "N/A"
          }</li>
          <li>Visible Websites: ${
            userData.visible_websites?.join(", ") || "N/A"
          }</li>
        </ul>
        
        <h2>Plan Information</h2>
        <ul>
          <li>Plan ID: ${userData.plan_id}</li>
          <li>Plan Type: ${userData.plan_type}</li>
        </ul>
        
        <h2>Address Information</h2>
        <ul>
          <li>Formatted Address: ${userData.formatted_address || "N/A"}</li>
          <li>Latitude: ${userData.latitude || "N/A"}</li>
          <li>Longitude: ${userData.longitude || "N/A"}</li>
          <li>No Address: ${userData.no_address ? "Yes" : "No"}</li>
        </ul>
        
        <h2>Invoice Information</h2>
        <ul>
          <li>Company Name: ${userData.invoice_company_name}</li>
          <li>Address: ${userData.invoice_address}</li>
          <li>City: ${userData.invoice_city}</li>
          <li>Zip Code: ${userData.invoice_zip_code}</li>
          <li>Country: ${userData.invoice_country}</li>
          <li>Extra Information: ${userData.invoice_extra || "N/A"}</li>
        </ul>
        
        <p>Please review and approve or reject this participant.</p>
      `,
    });
  } catch (error) {
    console.error(
      "Error sending moderator notification for participant:",
      error
    );
  }
}
