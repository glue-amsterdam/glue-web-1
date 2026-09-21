import { Resend } from "resend";
import { config } from "@/config";
import {
  getEmailTemplateWithFallback,
  processEmailTemplate,
} from "@/utils/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

const adminEmails = config.adminEmails
  .split(",")
  .filter((email) => email.trim() !== "");

type PlanNotificationFields = {
  plan_id: string;
  plan_type: string;
  plan_label: string;
  plan_price: number | string;
  plan_currency: string;
};

type ReviewCtaFields = {
  review_url: string;
};

export type ModeratorParticipantNotificationData = PlanNotificationFields &
  ReviewCtaFields & {
    user_id: string;
    user_name: string;
    email: string;
    intent: "new" | "upgrade";
    invoice_company_name: string;
    invoice_address: string;
    invoice_city: string;
    invoice_zip_code: string;
    invoice_country: string;
    invoice_extra?: string;
    formatted_address: string | null;
    latitude: number | null;
    longitude: number | null;
    no_address?: boolean;
    exhibition_space_preference?: string | null;
    social_media?: Record<string, string>;
    visible_emails?: string[];
    glue_communication_email?: string;
    visible_websites?: string[];
    phone_numbers?: string[];
  };

const formatPlanPrice = (currency: string, price: number | string) =>
  `${currency} ${price}`.trim();

const buildReviewCtaHtml = (reviewUrl: string, label: string) => `
  <p style="margin: 24px 0;">
    <a
      href="${reviewUrl}"
      style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 600;"
    >${label}</a>
  </p>
`;

const buildPlanListHtml = (plan: PlanNotificationFields) => `
  <h2>Plan Information</h2>
  <ul>
    <li>Plan: ${plan.plan_label}</li>
    <li>Price: ${formatPlanPrice(plan.plan_currency, plan.plan_price)}</li>
    <li>Plan Type: ${plan.plan_type}</li>
    <li>Plan ID: ${plan.plan_id}</li>
  </ul>
`;

async function sendEmail(subject: string, htmlContent: string) {
  if (adminEmails.length === 0) {
    console.warn("No admin emails configured. Skipping notification.");
    return;
  }

  try {
    await resend.emails.send({
      from: `GLUE <${config.baseEmail}>`,
      to: adminEmails,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendModeratorParticipantNotification(
  userData: ModeratorParticipantNotificationData,
) {
  const isUpgrade = userData.intent === "upgrade";
  const title = isUpgrade
    ? "Participant Upgrade Request"
    : "New Participant Registered";
  const summary = isUpgrade
    ? "A participant has requested a plan upgrade and requires approval."
    : "A new participant has registered and requires approval.";
  const intentLabel = isUpgrade ? "Upgrade" : "New application";
  const ctaLabel = isUpgrade
    ? "Review & accept upgrade"
    : "Review & accept participant";
  const ctaHtml = buildReviewCtaHtml(userData.review_url, ctaLabel);

  const htmlContent = `
    <h1>${title}</h1>
    <p>${summary}</p>
    <p><strong>Intent:</strong> ${intentLabel}</p>
    <p><strong>Email:</strong> ${userData.email}</p>
    <p><strong>Plan:</strong> ${userData.plan_label} (${formatPlanPrice(userData.plan_currency, userData.plan_price)})</p>
    ${ctaHtml}

    <h2>User Information</h2>
    <ul>
      <li>User ID: ${userData.user_id}</li>
      <li>Username: ${userData.user_name || "N/A"}</li>
      <li>Email: ${userData.email}</li>
      <li>Email for Practical GLUE Communication: ${userData.glue_communication_email || "N/A"}</li>
      <li>Phone Numbers: ${userData.phone_numbers?.join(", ") || "N/A"}</li>
      <li>Social Media: ${
        userData.social_media
          ? Object.entries(userData.social_media)
              .map(([platform, link]) => `${platform}: ${link}`)
              .join(", ")
          : "N/A"
      }</li>
      <li>Visible Emails: ${userData.visible_emails?.join(", ") || "N/A"}</li>
      <li>Visible Websites: ${userData.visible_websites?.join(", ") || "N/A"}</li>
    </ul>

    ${buildPlanListHtml(userData)}

    <h2>Address Information</h2>
    <ul>
      <li>Formatted Address: ${userData.formatted_address || "N/A"}</li>
      <li>Latitude: ${userData.latitude ?? "N/A"}</li>
      <li>Longitude: ${userData.longitude ?? "N/A"}</li>
      <li>No Address: ${userData.no_address ? "Yes" : "No"}</li>
      <li>Exhibition Space Preference: ${userData.exhibition_space_preference || "N/A"}</li>
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
    ${ctaHtml}
  `;

  await sendEmail(
    isUpgrade ? "Participant Upgrade Request" : "New Participant Registration",
    htmlContent,
  );
}

export async function sendModeratorReactivationNotification(userData: {
  user_id: string;
  user_name: string;
  email: string;
  plan_id: string;
  plan_type: string;
  plan_label: string;
  plan_price: number | string;
  plan_currency: string;
  review_url: string;
  invoice_company_name?: string;
  invoice_city?: string;
  invoice_country?: string;
  formatted_address?: string | null;
  exhibition_space_preference?: string | null;
  glue_communication_email?: string;
}) {
  const ctaHtml = buildReviewCtaHtml(
    userData.review_url,
    "Review/ accept reactivation",
  );

  const htmlContent = `
    <h1>Participant Reactivation Request</h1>
    <p>A participant has requested reactivation and requires approval.</p>
    <p><strong>Email:</strong> ${userData.email}</p>
    <p><strong>Name:</strong> ${userData.user_name || "N/A"}</p>
    <p><strong>Plan:</strong> ${userData.plan_label} (${formatPlanPrice(userData.plan_currency, userData.plan_price)})</p>

    <h2>User Information</h2>
    <ul>
      <li>User ID: ${userData.user_id}</li>
      <li>Username: ${userData.user_name || "N/A"}</li>
      <li>Email: ${userData.email}</li>
      <li>Email for Practical GLUE Communication: ${userData.glue_communication_email || "N/A"}</li>
    </ul>

    ${buildPlanListHtml(userData)}

    <h2>Location &amp; Invoice Snapshot</h2>
    <ul>
      <li>Formatted Address: ${userData.formatted_address || "N/A"}</li>
      <li>Exhibition Space Preference: ${userData.exhibition_space_preference || "N/A"}</li>
      <li>Invoice Company: ${userData.invoice_company_name || "N/A"}</li>
      <li>Invoice City: ${userData.invoice_city || "N/A"}</li>
      <li>Invoice Country: ${userData.invoice_country || "N/A"}</li>
    </ul>

    <p>Open the participant profile in the dashboard for full reactivation notes and to accept or decline.</p>
    ${ctaHtml}
  `;

  await sendEmail("Participant Reactivation Request", htmlContent);
}

export async function sendParticipantRegistrationEmail(userData: {
  email: string;
  user_name: string;
}) {
  try {
    const template = await getEmailTemplateWithFallback(
      "participant-registration",
    );
    const htmlContent = processEmailTemplate(template.html_content, {
      email: userData.email,
      user_name: userData.user_name,
    });

    await resend.emails.send({
      from: `GLUE <${config.baseEmail}>`,
      to: userData.email,
      subject: template.subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending participant registration email:", error);
    // No lanzamos el error para que el registro no falle si el email falla
  }
}
